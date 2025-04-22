import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMatchupsOptimized } from '$lib/workers/getMatchupsOptimize';

export const GET: RequestHandler = async ({ locals: { db } }) => {
	const matchup = await getMatchupsOptimized(db, 1);
	return json(matchup);
};
