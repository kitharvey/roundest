import { getMatchups } from '$lib/workers/getMatchups';
import type { KVNamespace } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		if (!platform?.env?.pokemon) {
			return json({ error: 'KV namespace not found' }, { status: 500 });
		}

		const kv = platform.env.pokemon as KVNamespace;
		const matchup = await getMatchups(kv, 1);

		return json({ matchup });
	} catch (error) {
		return json({ error }, { status: 500 });
	}
};
