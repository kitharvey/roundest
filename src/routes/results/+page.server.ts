import { getRankings } from '$lib/workers/getRankings';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { db }, url }) => {
	const limit = Number(url.searchParams.get('limit') || 10);
	const offset = Number(url.searchParams.get('offset') || 0);
	const searchTerm = url.searchParams.get('search') || undefined;

	const { rankings, total } = await getRankings(db, limit, offset, searchTerm);

	return { rankings, total };
};

export const actions: Actions = {
	default: async ({ request, locals: { db }, url }) => {
		const formData = await request.formData();
		const searchTerm = url.searchParams.get('search') || undefined;

		const limit = Number(formData.get('limit') || 10);
		const offset = Number(formData.get('offset') || 0);

		if (isNaN(limit) || isNaN(offset)) {
			return fail(400, { message: 'Invalid limit or offset' });
		}

		const { rankings, total } = await getRankings(db, limit, offset, searchTerm);

		return { rankings, total };
	}
};
