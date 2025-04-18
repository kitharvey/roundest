import { drizzle } from 'drizzle-orm/d1';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export let db: DrizzleD1Database;

export const getDb = (DB: D1Database): DrizzleD1Database => {
	db = drizzle(DB);
	return db;
};
