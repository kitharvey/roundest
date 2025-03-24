import { count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import { getMorePokemons } from '$lib/workers/getMorePokemons';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const totalResult = await db.select({ count: count() }).from(pokemonSchema);
	const total = totalResult[0]?.count || 0;
	return { total };
};

export const actions: Actions = {
	default: async ({ request, locals: { db } }) => {
		const data = await request.formData();
		const limit = Number(data.get('limit'));
		const offset = Number(data.get('offset'));
		const { logs } = await getMorePokemons(db, limit, offset);
		return { logs };
	}
};
