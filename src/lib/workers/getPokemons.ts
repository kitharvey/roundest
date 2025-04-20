import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PokemonType } from '$lib/types';
import { fetchWithRetry } from './fetchWithRetry';
import { uploadImageToR2 } from './uploadImageToR2';

// Pokémon API response types
interface PokemonResponse {
	name: string;
	url: string;
}

interface PokemonTypeRaw {
	name: string;
	url: string;
}

interface PokemonTypes {
	slot: number;
	type: PokemonTypeRaw;
}

interface PokemonDetails {
	id: number;
	sprites: {
		other?: {
			'official-artwork': {
				front_default: string;
			};
		};
	};
	types: PokemonTypes[];
}

// Result type for the function
interface GetPokemonsResult {
	message: string;
	saved: number;
	total: number;
	offset: number;
	limit: number;
	logs: string[];
}

/**
 * Fetches Pokémon data, processes it, and saves it with a concurrency limit.
 * @param db - The database instance.
 * @param limit - Number of Pokémon to fetch.
 * @param offset - Offset for the Pokémon list.
 * @param bucket - Optional R2 bucket for image storage.
 */
export async function getPokemons(
	db: DrizzleD1Database,
	limit = 25,
	offset = 0,
	bucket: R2Bucket | undefined
): Promise<GetPokemonsResult> {
	const logs: string[] = [];
	const MAX_CONCURRENT = 10; // Maximum number of concurrent tasks
	let activeTasks = 0; // Tracks currently running tasks
	let savedCount = 0; // Tracks successfully saved Pokémon
	const pokemonQueue: PokemonResponse[] = []; // Queue of Pokémon to process
	const taskPromises: Promise<void>[] = []; // Promises for all tasks

	try {
		logs.push(`[Process Start] Syncing Pokémon (offset: ${offset}, limit: ${limit})...`);

		// Fetch the list of Pokémon from the API
		const listResponse = await fetchWithRetry(
			`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
		);
		const { results }: { results: PokemonResponse[] } = await listResponse.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		// Add all Pokémon to the processing queue
		pokemonQueue.push(...results);

		// Function to process the next Pokémon in the queue
		const processNext = async () => {
			// Stop if queue is empty or max concurrency is reached
			if (pokemonQueue.length === 0 || activeTasks >= MAX_CONCURRENT) {
				return;
			}

			const pokemon = pokemonQueue.shift()!; // Take the next Pokémon
			activeTasks++; // Increment active tasks

			try {
				// Fetch Pokémon details
				const response = await fetchWithRetry(pokemon.url);
				const details: PokemonDetails = await response.json();
				const sprite = details.sprites.other?.['official-artwork']?.front_default;

				if (sprite && bucket) {
					const key = `pokemon/${details.id}.png`;
					const types = details.types.map((typeInfo) => typeInfo.type.name) as PokemonType[];
					const bucketURL = 'https://pokemon-images.kitharvey.dev/';
					const image = bucketURL + key;

					const uploadPromise = uploadImageToR2(sprite, bucket, key);
					const savePromise = db
						.insert(pokemonSchema)
						.values({
							name: pokemon.name,
							image: image,
							types: types,
							id: details.id
						})
						.onConflictDoUpdate({
							target: pokemonSchema.id,
							set: {
								name: pokemon.name,
								types: types,
								image: image
							}
						});

					await Promise.all([uploadPromise, savePromise]);
					logs.push(`[DB Save] Saved ${pokemon.name} (ID: ${details.id})`);
					savedCount++;
				}
			} catch (error) {
				logs.push(`[Process Error] Failed to process ${pokemon.name}: ${String(error)}`);
				console.error(`Error processing ${pokemon.name}:`, error);
			} finally {
				activeTasks--; // Decrement active tasks
				processNext(); // Start the next task if available
			}
		};

		// Start the initial batch of tasks
		for (let i = 0; i < MAX_CONCURRENT && pokemonQueue.length > 0; i++) {
			taskPromises.push(processNext());
		}

		// Wait for all tasks to complete
		await Promise.all(taskPromises);

		return {
			message: 'Pokémon batch processed successfully',
			saved: savedCount,
			total: results.length,
			offset,
			limit: limit,
			logs
		};
	} catch (error) {
		throw new Error(`Failed to process Pokémon data: ${String(error)}\nLogs: ${logs.join('\n')}`);
	}
}
