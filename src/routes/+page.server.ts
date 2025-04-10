import type { PageServerLoad } from './$types';
import { getMatchups } from '$lib/workers/getMatchups';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const matchups = await getMatchups(db, 7);
	return { matchups };
};
