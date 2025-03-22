import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const matchups = locals.matchups;
	return { matchups };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const winnerId = data.get('winner_id');
		const pokemon1Id = data.get('pokemon1_id');
		const pokemon2Id = data.get('pokemon2_id');
		console.log({ winnerId, pokemon1Id, pokemon2Id });
		if (winnerId && pokemon1Id && pokemon2Id) {
			const loserId = winnerId === pokemon1Id ? pokemon2Id : pokemon1Id;
			console.log({ winnerId, loserId });
		}

		await locals.fetchMatchups();
	}
};
