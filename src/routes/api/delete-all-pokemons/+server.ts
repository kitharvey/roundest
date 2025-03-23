import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		if (!platform?.env?.pokemon) {
			return json({ error: 'KV namespace not found' }, { status: 500 });
		}

		const kv = platform.env.pokemon;
		const keys = await kv.list({ prefix: 'pokemon:' });
		const deletePromises = keys.keys.map((key) => kv.delete(key.name));
		await Promise.all(deletePromises);
		await kv.delete('total_pokemon');

		return json({ message: 'All Pokémon data deleted successfully', deleted: keys.keys.length });
	} catch (error) {
		console.error('Error deleting all Pokemon data:', error);
		return json({ error: 'Failed to delete all Pokemon data' }, { status: 500 });
	}
};
