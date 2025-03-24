import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

interface PokemonResponse {
	name: string;
	url: string;
}

interface PokemonDetails {
	id: number;
	sprites: {
		front_default?: string;
	};
}

async function fetchWithRetry(url: string, retries = 3, timeoutMs = 5000): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				cf: {
					cacheTtl: 300,
					cacheEverything: true
				}
			});
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (i === retries - 1) throw error;
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
		}
	}
	throw new Error('Max retries reached');
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
			try {
				const response = await fetchWithRetry(pokemon.url);
				const details: PokemonDetails = await response.json();
				const image = details.sprites.front_default;
				if (image) {
					await db
						.insert(pokemonSchema)
						.values({
							name: pokemon.name,
							image: image,
							id: details.id
						})
						.onConflictDoUpdate({
							target: pokemonSchema.id,
							set: {
								name: pokemon.name,
								image: image
							}
						});
					logs.push(`[DB Save] Saved ${pokemon.name} (ID: ${details.id})`);
					savedCount++;
				}
			} catch (error) {
				logs.push(`[Process Error] Failed to process ${pokemon.name}: ${String(error)}`);
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
