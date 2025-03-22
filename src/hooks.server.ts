import { getMatchups } from '$lib/workers/getMatchups';
import type { KVNamespace } from '@cloudflare/workers-types';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.platform?.env?.pokemon) {
		const kv = event.platform.env.pokemon as KVNamespace;
		event.locals.matchups = await getMatchups(kv, 3); // Fetch 3 for preloading
	}
	const response = await resolve(event);
	return response;
};
