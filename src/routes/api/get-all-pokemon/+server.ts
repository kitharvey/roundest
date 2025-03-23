import { json, type RequestHandler } from '@sveltejs/kit';
import type { Pokemon } from '../../../app';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		if (!platform?.env?.pokemon) {
			return json({ error: 'KV namespace not found' }, { status: 500 });
		}
		const kv = platform.env.pokemon;
		const totalStr = await kv.get('total_pokemon');

		console.log('Total Pokémon:', totalStr);

		const keys = await kv.list({ prefix: 'pokemon:' });
		const pokemonPromises = keys.keys.map(async (key) => {
			const pokemonString = await kv.get(key.name);
			if (pokemonString) {
				return JSON.parse(pokemonString) as Pokemon;
			}
			return null;
		});

		const pokemonData = await Promise.all(pokemonPromises);

		return json({ pokemon: pokemonData, total: pokemonData.length, keys });
	} catch (error) {
		console.error('Error fetching Pokemon data:', error);
		return json({ error: 'Failed to fetch Pokemon data' }, { status: 500 });
	}
};
