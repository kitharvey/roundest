import { json, type RequestHandler } from '@sveltejs/kit';
import { pokemon as pokemonSchema, votes as votesSchema } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.db) {
			return json({ error: 'Database not found' }, { status: 500 });
		}

		await locals.db.delete(votesSchema);
		await locals.db.delete(pokemonSchema);

		return json({ message: 'All Pokémon data deleted successfully' });
	} catch (error) {
		console.error('Error deleting all Pokemon data:', error);
		return json({ error: 'Failed to delete all Pokemon data' }, { status: 500 });
	}
};
