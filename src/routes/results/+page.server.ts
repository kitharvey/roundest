import { getRankings } from '$lib/workers/getRankings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const rankings = await getRankings(db);

	return { rankings };
};
