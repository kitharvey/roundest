import { json, type RequestHandler } from '@sveltejs/kit';
import { pokemon as pokemonSchema } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.db) {
			return json({ error: 'Database not found' }, { status: 500 });
		}
		const pokemonData = await locals.db.select().from(pokemonSchema);

		if (!pokemonData) {
			return json({ error: 'No Pokemon found' }, { status: 404 });
		}

		return json({ pokemon: pokemonData, total: pokemonData.length });
	} catch (error) {
		console.error('Error fetching Pokemon data:', error);
		return json({ error: 'Failed to fetch Pokemon data' }, { status: 500 });
	}
};
