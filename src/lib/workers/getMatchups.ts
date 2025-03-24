// src/lib/workers/getMatchups.ts
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { Matchup } from '../../app';
import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import { count, sql } from 'drizzle-orm';

export async function getMatchups(db: DrizzleD1Database, matchupCount = 1): Promise<Matchup[]> {
	// Step 1: Get total count of Pokémon
	const totalResult = await db.select({ count: count() }).from(pokemonSchema);
	const total = totalResult[0]?.count || 0;
	if (total < 2) {
		console.error('Not enough Pokémon in database to create a matchup:', total);
		return [];
	}

	const matchups: Matchup[] = [];

	// Step 2: Fetch matchups in a single query per matchup
	for (let i = 0; i < matchupCount; i++) {
		const randomPokemon = await db
			.select()
			.from(pokemonSchema)
			.orderBy(sql`RANDOM()`)
			.limit(2); // Fetch exactly 2 random Pokémon

		if (randomPokemon.length < 2) {
			console.error('Failed to fetch enough Pokémon for matchup:', randomPokemon);
			continue;
		}

		const [pokemon1, pokemon2] = randomPokemon;
		matchups.push({ pokemon1, pokemon2 });
	}

	return matchups;
}
