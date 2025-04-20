import type { Session, User } from 'better-auth';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

declare global {
	namespace App {
		interface Platform {
			cf: CfProperties;
			ctx: ExecutionContext;
			env: {
				DB: D1Database;
				pokemon_images: R2Bucket;
			};
		}
		interface Locals {
			db: DrizzleD1Database;
			auth: BetterAuth;
			session: { session: Session; user: User } | null;
		}
	}
}
