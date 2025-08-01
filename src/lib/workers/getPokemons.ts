import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { GetPokemonsResult, PokemonDetails, PokemonResponse, PokemonType } from '$lib/types';
import { fetchWithRetry } from './fetchWithRetry';

export async function getPokemons(
	db: DrizzleD1Database,
	limit = 25,
	offset = 0
): Promise<GetPokemonsResult> {
	const logs: string[] = [];
	let savedCount = 0;
	const maxPokemon = 10258;
	try {
		logs.push(`[Process Start] Syncing Pokémon (offset: ${offset}, limit: ${limit})...`);

		// Adjust limit to not exceed maxPokemon
		const effectiveLimit = Math.min(limit, maxPokemon - offset);
		if (effectiveLimit <= 0) {
			return {
				message: 'Offset exceeds maximum Pokémon ID',
				saved: 0,
				total: 0,
				offset,
				limit,
				logs
			};
		}

		const listResponse = await fetchWithRetry(
			`https://pokeapi.co/api/v2/pokemon?limit=${effectiveLimit}&offset=${offset}`
		);
		const { results }: { results: PokemonResponse[] } = await listResponse.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		await Promise.all(
			results.map(async (pokemon) => {
				try {
					const response = await fetchWithRetry(pokemon.url);
					const details: PokemonDetails = await response.json();

					// Skip if Pokémon ID exceeds maxPokemon
					if (details.id > maxPokemon) {
						logs.push(`[Skipped] Pokémon ID ${details.id} exceeds maxPokemon (${maxPokemon})`);
						return;
					}

					const sprite = details.sprites.other?.['official-artwork']?.front_default;

					if (sprite) {
						const image = `https://pokemon-images.kitharvey.dev/pokemon/${details.id}.png`;
						const types = details.types.map((typeInfo) => typeInfo.type.name) as PokemonType[];

						await db
							.insert(pokemonSchema)
							.values({
								name: pokemon.name,
								image,
								types,
								id: details.id
							})
							.onConflictDoUpdate({
								target: pokemonSchema.id,
								set: {
									name: pokemon.name,
									types,
									image
								}
							});

						logs.push(`[DB Save] Saved ${pokemon.name} (ID: ${details.id})`);
						savedCount++;
					}
				} catch (error) {
					logs.push(`[Process Error] Failed to process ${pokemon.name}: ${String(error)}`);
					console.error(`Error processing ${pokemon.name}:`, error);
				}
			})
		);

		return {
			message: 'Pokémon batch processed successfully',
			saved: savedCount,
			total: results.length,
			offset,
			limit,
			logs
		};
	} catch (error) {
		throw new Error(`Failed to process Pokémon data: ${String(error)}\nLogs: ${logs.join('\n')}`);
	}
}
