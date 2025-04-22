/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Actions, PageServerLoad } from './$types';
import { votes as votesSchema } from '$lib/server/db/schema';
import { getMatchupsOptimized } from '$lib/workers/getMatchupsOptimize';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const matchups = await getMatchupsOptimized(db, 3);
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
			const [_, matchup] = await Promise.all([
				db.insert(votesSchema).values([
					{ pokemonId: winnerId, voteType: 'win' },
					{ pokemonId: loserId, voteType: 'loss' }
				]),
				getMatchupsOptimized(db, 1)
			]);
			return { success: true, matchup };
		} catch (error) {
			console.error('Vote recording failed:', error);
			return { success: false, error: 'Failed to record vote' };
		}
	}
};
