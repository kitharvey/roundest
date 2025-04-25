import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { pokemon, votes } from '$lib/server/db/schema';
import { sql, eq, like, count } from 'drizzle-orm'; // Changed: removed ilike, added like and lower

interface PokemonWithStats {
	id: number;
	name: string;
	image: string;
	winCount: number;
	totalVotes: number;
	winRate: number;
}

export async function getRankings(
	db: DrizzleD1Database,
	limit: number,
	offset: number,
	searchTerm?: string
): Promise<{ rankings: PokemonWithStats[]; total: number }> {
	let query = db
		.select({
			id: pokemon.id,
			name: pokemon.name,
			image: pokemon.image,
			winCount: sql<number>`COUNT(CASE WHEN ${votes.voteType} = 'win' THEN 1 END)`.as('winCount'),
			totalVotes: sql<number>`COUNT(${votes.id})`.as('totalVotes'),
			winRate: sql<number>`
                CASE
                    WHEN COUNT(${votes.id}) > 0
                    THEN (CAST(SUM(CASE WHEN ${votes.voteType} = 'win' THEN 1 ELSE 0 END) AS REAL) * 100.0 / COUNT(${votes.id}))
                    ELSE 0
                END
            `.as('winRate')
		})
		.from(pokemon)
		.leftJoin(votes, eq(pokemon.id, votes.pokemonId));

	// Apply search term filter using like and lower if provided
	if (searchTerm) {
		// Prepare the search pattern (Drizzle handles escaping for the value)
		query = query.where(like(sql`lower(${pokemon.name})`, `%${searchTerm.toLowerCase()}%`)); // Changed: Replaced ilike with like(lower(...), lower(...))
	}

	const rankingsQuery = query
		.groupBy(pokemon.id, pokemon.name, pokemon.image)
		.orderBy(sql`winRate DESC`, sql`totalVotes DESC`)
		.limit(limit)
		.offset(offset);

	// Use Drizzle's count() for the total query
	let totalQueryBase = db.select({ count: count(pokemon.id) }).from(pokemon);

	// Apply the same search term filter to the total query
	if (searchTerm) {
		// Use lower() on both column and pattern with like for case-insensitivity
		totalQueryBase = totalQueryBase.where(
			like(sql`lower(${pokemon.name})`, `%${searchTerm.toLowerCase()}%`)
		); // Changed: Replaced ilike with like(lower(...), lower(...))
	}
	// Assign the potentially filtered query
	const totalQuery = totalQueryBase;

	const [rankingsResult, totalResult] = await Promise.all([
		rankingsQuery.execute(),
		totalQuery.execute()
	]);

	const rankings = rankingsResult.map((row) => ({
		id: row.id,
		name: row.name,
		image: row.image,
		winCount: Number(row.winCount ?? 0), // Ensure number type, handle potential null from COUNT
		totalVotes: Number(row.totalVotes ?? 0), // Ensure number type, handle potential null from COUNT
		winRate: Number(row.winRate ?? 0.0) // Ensure number type, handle potential null/NaN
	}));

	// Use count() result directly
	const total = totalResult[0]?.count ?? 0;

	return { rankings, total };
}
