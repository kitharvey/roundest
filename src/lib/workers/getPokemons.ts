import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PokemonType } from '$lib/types';
import { fetchWithRetry } from './fetchWithRetry'; // Assuming fetchWithRetry is defined elsewhere

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
				front_default: string | null;
			};
		};
	};
	types: PokemonTypes[];
}

interface GetPokemonsResult {
	message: string;
	saved: number;
	total: number;
	offset: number;
	limit: number;
	logs: string[];
	errors: string[];
}

export async function getPokemons(
	db: DrizzleD1Database,
	limit = 25,
	offset = 0
): Promise<GetPokemonsResult> {
	const logs: string[] = [];
	const errors: string[] = [];
	let savedCount = 0;
	let results: PokemonResponse[] = [];

	try {
		logs.push(`[Process Start] Syncing Pokémon (offset: ${offset}, limit: ${limit})...`);

		// --- Initial List Fetch ---
		const listResponse = await fetchWithRetry(
			`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
		);

		const listContentType = listResponse.headers.get('content-type');

		if (!listResponse.ok || !listContentType?.includes('application/json')) {
			const errorText = await listResponse.text(); // Read response as text
			const errorMessage = `[List Fetch Error] Failed: ${listResponse.status} ${listResponse.statusText}. Content-Type: ${listContentType}. Response: ${errorText.substring(0, 200)}...`; // Log beginning of response
			logs.push(errorMessage);
			errors.push(errorMessage);
			console.error(errorMessage, errorText); // Log full text to console
			throw new Error(errorMessage);
		}

		const listData: { results: PokemonResponse[] } = await listResponse.json(); // Now safe to parse
		results = listData.results;
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon list items.`);

		// --- Sequential Processing Loop ---
		logs.push(`[Processing Start] Starting sequential processing of ${results.length} Pokémon.`);
		for (const [index, pokemon] of results.entries()) {
			const itemLogPrefix = `[Item ${index + 1}/${results.length} - ${pokemon.name}]`;
			logs.push(`${itemLogPrefix} Starting fetch...`);

			try {
				const response = await fetchWithRetry(pokemon.url);
				const contentType = response.headers.get('content-type');

				// **Robustness Check:** Verify status and content type before parsing JSON
				if (!response.ok || !contentType?.includes('application/json')) {
					const errorText = await response.text(); // Get the actual response body (likely HTML)
					const detailErrorMsg = `${itemLogPrefix} Detail Fetch Error: ${response.status} ${response.statusText}. Content-Type: ${contentType}. Response: ${errorText.substring(0, 200)}...`;
					logs.push(detailErrorMsg);
					errors.push(detailErrorMsg);
					console.error(
						`Error fetching details for ${pokemon.name}: Status ${response.status}, Content-Type: ${contentType}`,
						errorText
					); // Log full text
					continue; // Skip this Pokémon
				}

				// **Safe JSON Parsing:** Now we expect valid JSON
				const details: PokemonDetails = await response.json();
				const image = details.sprites.other?.['official-artwork']?.front_default;

				if (image) {
					logs.push(`${itemLogPrefix} Image found. Preparing database upsert...`);
					const pokemonData = {
						id: details.id,
						name: pokemon.name,
						image: image,
						types: details.types.map((typeInfo) => typeInfo.type.name) as PokemonType[]
					};

					// --- Database Operation ---
					await db
						.insert(pokemonSchema)
						.values(pokemonData)
						.onConflictDoUpdate({
							target: pokemonSchema.id,
							set: {
								name: pokemonData.name,
								types: pokemonData.types,
								image: pokemonData.image
							}
						});

					logs.push(`${itemLogPrefix} DB Upsert Success (ID: ${details.id})`);
					savedCount++;
				} else {
					const noImageMsg = `${itemLogPrefix} No official artwork image found. Skipping save.`;
					logs.push(noImageMsg);
				}
			} catch (error) {
				// Catch JSON parsing errors or DB errors
				const processErrorMsg = `${itemLogPrefix} Processing Error: ${error instanceof Error ? error.message : String(error)}`;
				logs.push(processErrorMsg);
				errors.push(processErrorMsg);
				console.error(`Error processing ${pokemon.name}:`, error);
			}
			logs.push(`${itemLogPrefix} Finished processing.`);
		}
		logs.push(
			`[Processing End] Finished sequential processing. Saved: ${savedCount}/${results.length}. Errors: ${errors.length}.`
		);

		return {
			message: `Pokémon batch processed. Saved: ${savedCount}/${results.length}. Errors: ${errors.length}.`,
			saved: savedCount,
			total: results.length,
			offset,
			limit: limit,
			logs,
			errors
		};
	} catch (error) {
		// Catch errors from initial list fetch or other unexpected issues
		const overallErrorMsg = `[Overall Error] Failed to process Pokémon batch: ${error instanceof Error ? error.message : String(error)}`;
		logs.push(overallErrorMsg);
		errors.push(overallErrorMsg);
		console.error('Overall error in getPokemons:', error);

		// Return summary indicating failure
		return {
			message: `Pokémon batch processing failed. See errors. Processed: ${savedCount}/${results.length}.`,
			saved: savedCount,
			total: results.length, // Total attempted might be 0 if list fetch failed early
			offset,
			limit: limit,
			logs,
			errors
		};
	}
}
