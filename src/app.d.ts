import type { DrizzleD1Database } from 'drizzle-orm/d1';

declare global {
	type PokemonType =
		| 'normal'
		| 'fire'
		| 'fighting'
		| 'water'
		| 'flying'
		| 'grass'
		| 'poison'
		| 'electric'
		| 'ground'
		| 'psychic'
		| 'rock'
		| 'ice'
		| 'bug'
		| 'dragon'
		| 'ghost'
		| 'dark'
		| 'steel'
		| 'fairy';

	interface Pokemon {
		id: number;
		name: string;
		image: string;
		types?: PokemonType[];
	}

	interface Matchup {
		pokemon1: Pokemon;
		pokemon2: Pokemon;
	}

	namespace App {
		interface Platform {
			cf: CfProperties;
			ctx: ExecutionContext;
			env: {
				pokemon: KVNamespace;
			};
		}
		interface Locals {
			// Matchup is now globally defined, no import needed
			matchups: Matchup[] | null;
			db: DrizzleD1Database;
		}
	}
}
