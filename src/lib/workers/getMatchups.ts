// src/lib/workers/getMatchups.ts
import type { Matchup, Pokemon } from '../../app';
import type { KVNamespace } from '@cloudflare/workers-types';

export async function getMatchups(kv: KVNamespace, count = 1): Promise<Matchup[]> {
	const totalStr = await kv.get('total_pokemon');
	const total = totalStr ? parseInt(totalStr, 10) : 0;
	if (total <= 1) {
		console.error('Invalid total_pokemon value:', total);
		return []; // Early return to avoid infinite loop or errors
	}

	const matchups: Matchup[] = [];
	const attemptsPerMatchup = 5; // Limit retries to avoid excessive CPU

	for (let i = 0; i < count; i++) {
		let attempts = 0;
		let pokemon1: Pokemon | null = null;
		let pokemon2: Pokemon | null = null;

		while (attempts < attemptsPerMatchup) {
			const id1 = Math.floor(Math.random() * total) + 1;
			const id2 = Math.floor(Math.random() * total) + 1;
			if (id2 === id1) continue; // Skip if IDs match

			const [pokemon1Str, pokemon2Str] = await Promise.all([
				kv.get(`pokemon:${id1}`),
				kv.get(`pokemon:${id2}`)
			]);

			if (pokemon1Str && pokemon2Str) {
				pokemon1 = JSON.parse(pokemon1Str) as Pokemon;
				pokemon2 = JSON.parse(pokemon2Str) as Pokemon;
				break;
			}
			attempts++;
		}

		if (pokemon1 && pokemon2) {
			matchups.push({ pokemon1, pokemon2 });
		} else {
			console.error(`Failed to fetch valid Pokémon pair after ${attemptsPerMatchup} attempts`);
		}
	}

	return matchups;
}
