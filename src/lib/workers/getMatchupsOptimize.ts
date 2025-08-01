import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { pokemon as pokemonSchema } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { Matchup } from '$lib/types';

// Cache for total Pokemon count to avoid repeated COUNT queries
let cachedPokemonCount: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper functions for generating unique Pokemon pairs
export const getRandomPokemon = (totalPokemon: number, notThisOne?: number): number => {
	const pokedexNumber = Math.floor(Math.random() * totalPokemon) + 1;
	if (pokedexNumber !== notThisOne) return pokedexNumber;
	return getRandomPokemon(totalPokemon, notThisOne);
};

export const getOptionsForVote = (totalPokemon: number): [number, number] => {
	const firstId = getRandomPokemon(totalPokemon);
	const secondId = getRandomPokemon(totalPokemon, firstId);
	return [firstId, secondId];
};

async function getPokemonCount(db: DrizzleD1Database): Promise<number> {
	const now = Date.now();

	// Return cached count if still valid
	if (cachedPokemonCount !== null && now - cacheTimestamp < CACHE_DURATION) {
		return cachedPokemonCount;
	}

	// Fetch new count
	const result = await db.select({ count: sql<number>`COUNT(*)` }).from(pokemonSchema);

	cachedPokemonCount = result[0]?.count || 0;
	cacheTimestamp = now;

	return cachedPokemonCount;
}

async function getMatchupsOptimizedInternal(
	db: DrizzleD1Database,
	matchupCount = 1
): Promise<Matchup[]> {
	if (matchupCount <= 0) {
		return [];
	}

	// Get total Pokemon count (cached)
	const totalPokemon = await getPokemonCount(db);

	if (totalPokemon < 2) {
		console.warn(`Only ${totalPokemon} Pokémon in database, not enough for matchups.`);
		return [];
	}

	const maxPossibleMatchups = Math.floor(totalPokemon / 2);
	const actualMatchupCount = Math.min(matchupCount, maxPossibleMatchups);

	// Generate unique Pokemon pairs using the recursive logic
	const pokemonIds = new Set<number>();
	const pairs: [number, number][] = [];

	for (let i = 0; i < actualMatchupCount; i++) {
		let attempts = 0;
		let validPair: [number, number] | null = null;

		// Try to generate a valid pair (not already used)
		while (attempts < 100 && !validPair) {
			// Prevent infinite loops
			const [firstId, secondId] = getOptionsForVote(totalPokemon);

			// Check if both IDs are available (not already used)
			if (!pokemonIds.has(firstId) && !pokemonIds.has(secondId)) {
				validPair = [firstId, secondId];
				pokemonIds.add(firstId);
				pokemonIds.add(secondId);
			}
			attempts++;
		}

		if (validPair) {
			pairs.push(validPair);
		} else {
			console.warn(`Could not generate unique pair for matchup ${i + 1}`);
			break;
		}
	}

	// If no pairs generated, return empty array (will trigger retry)
	if (pairs.length === 0) {
		return [];
	}

	// Batch fetch all needed Pokemon by IDs
	const allIds = Array.from(pokemonIds);
	const pokemonList = await db
		.select()
		.from(pokemonSchema)
		.where(
			sql`${pokemonSchema.id} IN (${sql.join(
				allIds.map((id) => sql`${id}`),
				sql`, `
			)})`
		)
		.limit(allIds.length);

	// Create a Map for O(1) lookups
	const pokemonMap = new Map(pokemonList.map((p) => [p.id, p]));

	// Create matchups from the generated pairs
	const matchups: Matchup[] = [];
	for (const [firstId, secondId] of pairs) {
		const pokemon1 = pokemonMap.get(firstId);
		const pokemon2 = pokemonMap.get(secondId);

		if (pokemon1 && pokemon2) {
			matchups.push({ pokemon1, pokemon2 });
		}
	}

	return matchups;
}

export async function getMatchupsOptimized(
	db: DrizzleD1Database,
	matchupCount = 1
): Promise<Matchup[]> {
	let retryCount = 0;
	let shouldRetry = true;

	while (shouldRetry) {
		try {
			const matchups = await getMatchupsOptimizedInternal(db, matchupCount);

			// If we got 0 matchups and we expected some, retry
			if (matchups.length === 0 && matchupCount > 0) {
				retryCount++;
				console.warn(`Attempt ${retryCount}: Got 0 matchups, retrying...`);

				// Small delay before retry to avoid hammering the database
				await new Promise((resolve) => setTimeout(resolve, 50));
				continue; // Keep retrying
			}

			// Success case - break the loop
			shouldRetry = false;

			if (matchups.length < matchupCount && matchups.length > 0) {
				console.warn(`Generated ${matchups.length} matchups, requested ${matchupCount}.`);
			}

			return matchups;
		} catch (error) {
			retryCount++;
			console.error(`Database error fetching matchups (attempt ${retryCount}):`, error);

			// For database errors, you might want to break after some attempts
			// Set shouldRetry = false here if you want to stop on persistent errors
			// For now, we'll keep retrying indefinitely

			// Small delay before retry
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	// This should never be reached, but TypeScript requires it
	return [];
}

// Alternative approach using OFFSET for even better performance on some databases
export async function getMatchupsWithOffset(
	db: DrizzleD1Database,
	matchupCount = 1
): Promise<Matchup[]> {
	if (matchupCount <= 0) {
		return [];
	}

	try {
		const totalPokemon = await getPokemonCount(db);

		if (totalPokemon < 2) {
			return [];
		}

		const maxPossibleMatchups = Math.floor(totalPokemon / 2);
		const actualMatchupCount = Math.min(matchupCount, maxPossibleMatchups);
		const pokemonNeeded = actualMatchupCount * 2;

		// Generate random offsets
		const offsets = new Set<number>();

		// Keep generating until we have enough unique offsets
		while (offsets.size < pokemonNeeded) {
			const batchSize = Math.max(32, (pokemonNeeded - offsets.size) * 2);
			const uint32Array = new Uint32Array(batchSize);
			crypto.getRandomValues(uint32Array);

			for (let i = 0; i < uint32Array.length && offsets.size < pokemonNeeded; i++) {
				const offset = uint32Array[i] % totalPokemon;
				offsets.add(offset);
			}
		}

		// Fetch Pokemon using multiple OFFSET queries in parallel
		const pokemonPromises = Array.from(offsets).map((offset) =>
			db.select().from(pokemonSchema).offset(offset).limit(1)
		);

		const pokemonResults = await Promise.all(pokemonPromises);
		const pokemonList = pokemonResults.map((result) => result[0]).filter(Boolean);

		// Create matchups
		const matchups: Matchup[] = [];
		for (let i = 0; i < pokemonList.length - 1; i += 2) {
			const pokemon1 = pokemonList[i];
			const pokemon2 = pokemonList[i + 1];

			if (pokemon1 && pokemon2 && pokemon1.id !== pokemon2.id) {
				matchups.push({ pokemon1, pokemon2 });
			}
		}

		return matchups.slice(0, actualMatchupCount);
	} catch (error) {
		console.error('Database error fetching matchups:', error);
		throw new Error('Failed to fetch Pokémon matchups from the database.', {
			cause: error
		});
	}
}
