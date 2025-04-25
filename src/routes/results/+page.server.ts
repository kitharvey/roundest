import { getRankings } from '$lib/workers/getRankings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { db }, url }) => {
	const limit = Number(url.searchParams.get('limit') || 10);
	const offset = Number(url.searchParams.get('offset') || 0);
	const searchTerm = url.searchParams.get('search') || undefined;

	const { rankings, total } = await getRankings(db, limit, offset, searchTerm);

	return { rankings, total };
};
