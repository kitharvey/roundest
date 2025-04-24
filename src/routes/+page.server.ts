import { pokemon } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const randomPokemonList = await db
		.select()
		.from(pokemon)
		.orderBy(sql`RANDOM()`)
		.limit(12);

	return {
		pokemons: randomPokemonList
	};
};
