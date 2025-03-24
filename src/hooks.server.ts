import type { Handle } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.platform?.env?.DB) {
		const DB = event.platform.env.DB;
		event.locals.db = drizzle(DB);
	}

	const response = await resolve(event);
	return response;
};
