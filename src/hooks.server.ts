import type { Handle } from '@sveltejs/kit';
import { getMatchups } from '$lib/workers/getMatchups';
import type { KVNamespace } from '@cloudflare/workers-types';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.fetchMatchups = async () => {
		if (event.platform?.env?.pokemon) {
			const kv = event.platform.env.pokemon as KVNamespace;
			const matchups = await getMatchups(kv, 1);
			event.locals.matchups = matchups;
			return matchups;
		}
		return [];
	};
	event.locals.matchups = await event.locals.fetchMatchups();

	const response = await resolve(event);
	return response;
};
