import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { pokemon } from './schema';

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(env: Env) {
		const db = drizzle(env.DB);
		const result = await db.select().from(pokemon).all();
		return Response.json(result);
	}
};
