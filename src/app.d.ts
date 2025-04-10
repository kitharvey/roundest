import type { DrizzleD1Database } from 'drizzle-orm/d1';

declare global {
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
