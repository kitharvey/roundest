import type { PageServerLoad } from './$types';
import { getMatchupsOptimized } from '$lib/workers/getMatchupsOptimize';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const matchups = await getMatchupsOptimized(db, 3);
	return { matchups };
};
