import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { Matchup } from '$lib/types';

export async function getMatchupsOptimized(
	db: DrizzleD1Database,
	matchupCount = 1
): Promise<Matchup[]> {
	const matchups: Matchup[] = [];
	const totalPokemonNeeded = matchupCount * 2;

	if (totalPokemonNeeded <= 0) {
		return [];
	}

	try {
		const randomPokemonList = await db
			.select()
			.from(pokemonSchema)
			.orderBy(sql`RANDOM()`)
			.limit(totalPokemonNeeded);

		const actualPokemonFetched = randomPokemonList.length;

		if (actualPokemonFetched < 2) {
			console.warn(`Workspaceed only ${actualPokemonFetched} Pokémon, not enough for a matchup.`);
			return [];
		}

		const possibleMatchups = Math.floor(actualPokemonFetched / 2);

		for (let i = 0; i < possibleMatchups; i++) {
			if (matchups.length >= matchupCount) {
				break;
			}

			const pokemon1 = randomPokemonList[i * 2];
			const pokemon2 = randomPokemonList[i * 2 + 1];

			if (pokemon1.id === pokemon2.id) {
				console.warn(
					`Skipping matchup due to duplicate Pokémon ID found in pair generation: ${pokemon1.id}`
				);
				continue;
			}

			matchups.push({ pokemon1, pokemon2 });
		}

		if (matchups.length < matchupCount) {
			console.warn(
				`Generated ${matchups.length} matchups, less than requested ${matchupCount}. ` +
					`Possible reasons: insufficient Pokémon in DB (${actualPokemonFetched} fetched), ` +
					`or duplicates encountered during pairing.`
			);
		}
	} catch (error) {
		console.error('Database error fetching matchups:', error);
		throw new Error('Failed to fetch Pokémon matchups from the database.', {
			cause: error
		});
	}

	return matchups;
}
