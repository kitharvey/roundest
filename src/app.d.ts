// See https://svelte.dev/docs/kit/types#app.d.ts

import type { DrizzleD1Database } from 'drizzle-orm/d1';

// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
			env: {
				pokemon: KVNamespace;
			};
		}
		interface Locals {
			matchups: Matchup[] | null;
			db: DrizzleD1Database;
		}
	}
}

interface Pokemon {
	id: number;
	name: string;
	image: string;
}

interface Matchup {
	pokemon1: Pokemon;
	pokemon2: Pokemon;
}

export { Pokemon, Matchup };
