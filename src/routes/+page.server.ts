import type { Actions, PageServerLoad } from './$types';
import { getMatchups } from '$lib/workers/getMatchups';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const matchups = await getMatchups(db, 1);
	return { matchups };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const winnerId = data.get('winner_id');
		const pokemon1Id = data.get('pokemon1_id');
		const pokemon2Id = data.get('pokemon2_id');
		console.log({ winnerId, pokemon1Id, pokemon2Id });
		if (winnerId && pokemon1Id && pokemon2Id) {
			const loserId = winnerId === pokemon1Id ? pokemon2Id : pokemon1Id;
			console.log({ winnerId, loserId });
		}
	}
};
