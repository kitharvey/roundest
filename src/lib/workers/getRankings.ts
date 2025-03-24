import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { pokemon, votes } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';

// Add image to the interface
interface PokemonWithStats {
	id: number;
	name: string;
	image: string; // Added this field
	winCount: number;
	totalVotes: number;
	winRate: number;
}

export async function getRankings(db: DrizzleD1Database): Promise<PokemonWithStats[]> {
	// Add image to the select query
	const result = await db
		.select({
			id: pokemon.id,
			name: pokemon.name,
			image: pokemon.image,
			winCount: sql<number>`COUNT(CASE WHEN ${votes.voteType} = 'win' THEN 1 END)`,
			totalVotes: sql<number>`COUNT(${votes.id})`
		})
		.from(pokemon)
		.leftJoin(votes, eq(pokemon.id, votes.pokemonId))
		.groupBy(pokemon.id, pokemon.name, pokemon.image);

	// Include image in the rankings mapping
	const rankings = result.map((row) => {
		const winRate = row.totalVotes > 0 ? (row.winCount / row.totalVotes) * 100 : 0;
		return {
			id: row.id,
			name: row.name,
			image: row.image,
			winCount: row.winCount,
			totalVotes: row.totalVotes,
			winRate
		};
	});

	rankings.sort((a, b) => {
		if (b.winRate !== a.winRate) {
			return b.winRate - a.winRate;
		}
		return b.totalVotes - a.totalVotes;
	});

	return rankings;
}
