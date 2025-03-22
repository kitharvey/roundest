import { getMatchups } from '$lib/workers/getMatchups';
import type { KVNamespace } from '@cloudflare/workers-types';
import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!platform?.env?.pokemon) {
		throw error(500, 'KV namespace not found');
	}

	const kv = platform.env.pokemon as KVNamespace;
	locals.matchups = await getMatchups(kv, 1);

	const matchups = locals.matchups;
	return { matchups };
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const data = await request.formData();
		const winnerId = data.get('winner_id');
		const pokemon1Id = data.get('pokemon1_id');
		const pokemon2Id = data.get('pokemon2_id');
		console.log({ winnerId, pokemon1Id, pokemon2Id });
		if (winnerId && pokemon1Id && pokemon2Id) {
			const loserId = winnerId === pokemon1Id ? pokemon2Id : pokemon1Id;
			console.log({ winnerId, loserId });
		}
		if (!platform?.env?.pokemon) {
			throw error(500, 'KV namespace not found');
		}
		const kv = platform.env.pokemon as KVNamespace;
		locals.matchups = await getMatchups(kv, 1);
	}
};
