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

	if (searchTerm) {
		query = query.where(like(sql`lower(${pokemon.name})`, `%${searchTerm.toLowerCase()}%`));
	}

	const rankingsQuery = query
		.groupBy(pokemon.id, pokemon.name, pokemon.image)
		.orderBy(sql`winRate DESC`, sql`totalVotes DESC`)
		.limit(limit)
		.offset(offset);

	let totalQueryBase = db.select({ count: count(pokemon.id) }).from(pokemon);

	if (searchTerm) {
		totalQueryBase = totalQueryBase.where(
			like(sql`lower(${pokemon.name})`, `%${searchTerm.toLowerCase()}%`)
		);
	}
	const totalQuery = totalQueryBase;

	const [rankingsResult, totalResult] = await Promise.all([
		rankingsQuery.execute(),
		totalQuery.execute()
	]);

	const rankings = rankingsResult.map((row) => ({
		id: row.id,
		name: row.name,
		image: row.image,
		winCount: Number(row.winCount ?? 0),
		totalVotes: Number(row.totalVotes ?? 0),
		winRate: Number(row.winRate ?? 0.0)
	}));

	const total = totalResult[0]?.count ?? 0;

	return { rankings, total };
}
