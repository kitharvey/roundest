import { count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { pokemon as pokemonSchema, votes as votesSchema } from '$lib/server/db/schema';
import { getPokemons } from '$lib/workers/getPokemons';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const totalResult = await db.select({ count: count() }).from(pokemonSchema);
	const total = totalResult[0]?.count || 0;
	return { total };
};

export const actions: Actions = {
	add: async ({ request, locals: { db } }) => {
		const data = await request.formData();
		const limit = Number(data.get('limit'));
		const offset = Number(data.get('offset'));
		const { logs } = await getPokemons(db, limit, offset);
		return { logs };
	},
	delete: async ({ locals: { db } }) => {
		await db.delete(votesSchema);
		await db.delete(pokemonSchema);
		return { message: 'All Pokémon data deleted successfully' };
	},
	get: async ({ locals: { db } }) => {
		const pokemonData = await db.select().from(pokemonSchema);
		return { pokemon: pokemonData, total: pokemonData.length };
	}
};
