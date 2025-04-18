import { DrizzleD1Database } from 'drizzle-orm/d1';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { account, session, user, verification } from '$lib/server/db/schema';

export const getAuth = (db: DrizzleD1Database) => {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema: {
				user,
				session,
				account,
				verification
			}
		}),
		socialProviders: {
			github: {
				clientId: GITHUB_CLIENT_ID as string,
				clientSecret: GITHUB_CLIENT_SECRET as string
			}
		},

		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60 // Cache duration in seconds
			}
		}
	});
};

// Uncomment this section if running npx @better-auth/cli generate --config=path/to/auth

// export const auth = betterAuth({
// 	database: drizzleAdapter(db, {
// 		provider: 'sqlite'
// 	}),
// 	socialProviders: {
// 		reddit: {
// 			clientId: GITHUB_CLIENT_ID as string,
// 			clientSecret: GITHUB_CLIENT_SECRET as string
// 		}
// 	}
// });
