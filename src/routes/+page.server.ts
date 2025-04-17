import { getMatchupsOptimized } from '$lib/workers/getMatchupsOptimize';
import type { PageServerLoad } from './$types';

function shuffle<T>(array: T[]): T[] {
	const shuffled = array.slice();
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export const load: PageServerLoad = async ({ locals: { db } }) => {
	const matchups = await getMatchupsOptimized(db, 3);
	const allPokemonUnsorted = matchups.flatMap((matchup) => [matchup.pokemon1, matchup.pokemon2]);
	const allPokemonQuadrupled = Array.from({ length: 4 }).flatMap(() => allPokemonUnsorted);
	const shuffledPokemon = shuffle(allPokemonQuadrupled);

	return {
		pokemons: shuffledPokemon
	};
};
