import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export async function getMatchups(db: DrizzleD1Database, matchupCount = 1): Promise<Matchup[]> {
	const matchups: Matchup[] = [];

	for (let i = 0; i < matchupCount; i++) {
		const randomPokemon = await db
			.select()
			.from(pokemonSchema)
			.orderBy(sql`RANDOM()`)
			.limit(2);

		if (randomPokemon.length < 2) {
			console.error('Failed to fetch enough Pokémon for matchup:', randomPokemon);
			continue;
		}

		const [pokemon1, pokemon2] = randomPokemon;
		matchups.push({ pokemon1, pokemon2 });
	}

	return matchups;
}
