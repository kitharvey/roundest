import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { getImage } from './getImage';
import type { PokemonType } from '$lib/types';
import { fetchWithRetry } from './fetchWithRetry';

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
		front_default?: string;
	};
	types: PokemonTypes[];
}

interface GetMorePokemonsResult {
	message: string;
	saved: number;
	total: number;
	offset: number;
	limit: number;
	logs: string[];
}

export async function getMorePokemons(
	db: DrizzleD1Database,
	limit = 25,
	offset = 0
): Promise<GetMorePokemonsResult> {
	const logs: string[] = [];

	try {
		logs.push(`[Process Start] Syncing Pokémon (offset: ${offset}, limit: ${limit})...`);

		const listResponse = await fetchWithRetry(
			`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
		);

		const { results }: { results: PokemonResponse[] } = await listResponse.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		let savedCount = 0;
		const processPromises = results.map(async (pokemon) => {
			const response = await fetchWithRetry(pokemon.url);
			const details: PokemonDetails = await response.json();

			const image = getImage(details.id);

			try {
				await db
					.insert(pokemonSchema)
					.values({
						name: pokemon.name,
						image: image,
						types: details.types.map((typeInfo) => typeInfo.type.name) as PokemonType[],
						id: details.id
					})
					.onConflictDoUpdate({
						target: pokemonSchema.id,
						set: {
							name: pokemon.name,
							types: details.types.map((typeInfo) => typeInfo.type.name) as PokemonType[],
							image: image
						}
					});

				logs.push(`[DB Save] Saved ${pokemon.name} (ID: ${details.id})`);
				savedCount++;
			} catch (error) {
				logs.push(`[Process Error] Failed to process ${pokemon.name}: ${String(error)}`);
				console.error(`Error processing ${pokemon.name}:`, error);
			}
		});

		await Promise.all(processPromises);

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
