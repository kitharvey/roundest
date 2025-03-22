import type { Matchup, Pokemon } from '../../app';
import type { KVNamespace } from '@cloudflare/workers-types';

export async function getMatchups(kv: KVNamespace, count = 1) {
	const totalStr = await kv.get('total_pokemon'); // Fetch total once
	const total = totalStr ? parseInt(totalStr, 10) : 0;
	const matchups: Matchup[] = [];

	for (let i = 0; i < count; i++) {
		let id1 = Math.floor(Math.random() * total) + 1;
		let id2 = Math.floor(Math.random() * total) + 1;
		while (id2 === id1) {
			// Ensure distinct Pokémon
			id2 = Math.floor(Math.random() * total) + 1;
		}
		if (id1 > id2) {
			// Optional: sort for consistency
			[id1, id2] = [id2, id1];
		}
		const pokemon1Str = await kv.get(`pokemon:${id1}`);
		const pokemon2Str = await kv.get(`pokemon:${id2}`);
		if (!pokemon1Str || !pokemon2Str) {
			console.error(`Failed to fetch Pokémon data for IDs: ${id1}, ${id2}`);
			continue;
		}

		const pokemon1 = JSON.parse(pokemon1Str) as Pokemon;
		const pokemon2 = JSON.parse(pokemon2Str) as Pokemon;

		matchups.push({ pokemon1, pokemon2 });
	}

	return matchups;
}
