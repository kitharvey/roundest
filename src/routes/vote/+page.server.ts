import type { Actions, PageServerLoad } from './$types';
import { getMatchups } from '$lib/workers/getMatchups';
import { votes } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const matchups = await getMatchups(db, 3);
	return { matchups };
};

export const actions: Actions = {
	default: async ({ request, locals: { db } }) => {
		const data = await request.formData();
		const winnerId = Number(data.get('winner_id'));
		const pokemon1Id = Number(data.get('pokemon1_id'));
		const pokemon2Id = Number(data.get('pokemon2_id'));

		if (isNaN(winnerId) || isNaN(pokemon1Id) || isNaN(pokemon2Id)) {
			return { success: false, error: 'Invalid input data' };
		}

		const loserId = winnerId === pokemon1Id ? pokemon2Id : pokemon1Id;

		try {
			await db.insert(votes).values({ pokemonId: winnerId, voteType: 'win' });
			await db.insert(votes).values({ pokemonId: loserId, voteType: 'loss' });

			const matchup = await getMatchups(db, 1);
			return { success: true, matchup };
		} catch (error) {
			console.error('Vote recording failed:', error);
			return { success: false, error: 'Failed to record vote' };
		}
	}
};
