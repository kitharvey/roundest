import { json, type RequestHandler } from '@sveltejs/kit';

interface Pokemon {
	id: number;
	name: string;
	image: string;
}

interface PokemonResponse {
	name: string;
	url: string;
}

interface PokemonDetails {
	id: number;
	sprites: {
		other: {
			'official-artwork': {
				front_default: string;
			};
		};
	};
}

// Fetch with timeout and retries
async function fetchWithRetry(url: string, retries = 3, timeoutMs = 15000): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			console.log(`[Fetch Attempt] Attempting to fetch ${url} (Attempt ${i + 1}/${retries})...`);
			const response = await fetch(url, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			console.log(`[Fetch Success] Successfully fetched ${url}`);
			return response;
		} catch (error) {
			if (i === retries - 1) throw error;
			console.warn(`Retrying fetch for ${url} after error:`, error);
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
		}
	}
	throw new Error('Max retries reached');
}

export const GET: RequestHandler = async ({ platform }) => {
	try {
		console.log('[Process Start] Starting to fetch Pokémon list...');

		// Check if KV namespace is available
		if (!platform?.env?.pokemon) {
			console.error('[KV Error] KV namespace not found');
			return json({ error: 'KV namespace not found' }, { status: 500 });
		}

		const kv = platform.env.pokemon;
		console.log('KV namespace accessed successfully.');

		// Fetch the full list of Pokémon
		const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
		if (!listResponse.ok) {
			throw new Error(`Failed to fetch Pokémon list: ${listResponse.statusText}`);
		}

		const { results }: { results: PokemonResponse[] } = await listResponse.json();
		console.log(`[List Fetch Success] Fetched Pokémon list with ${results.length} entries.`);

		// Extract IDs from URLs
		const pokemonWithIds = results.map((pokemon) => ({
			...pokemon,
			id: parseInt(pokemon.url.split('/').slice(-2, -1)[0], 10)
		}));
		console.log('[ID Extraction] Extracted IDs from Pokémon URLs.');

		// Get existing keys from KV
		console.log('Fetching existing keys from KV storage...');
		const existingKeys = await kv.list({ prefix: 'pokemon:' });
		const existingIds = existingKeys.keys.map((key) => parseInt(key.name.split(':')[1], 10));
		console.log(`Found ${existingIds.length} Pokémon already saved in KV.`);

		// Filter missing Pokémon
		const missingPokemon = pokemonWithIds.filter((p) => !existingIds.includes(p.id));
		const totalMissing = missingPokemon.length;

		if (totalMissing === 0) {
			console.log('[Process Complete] All Pokémon are already saved.');
			return json({ message: 'All Pokémon are already saved' });
		}

		console.log(`[Missing Pokémon] Found ${totalMissing} missing Pokémon to fetch and save.`);

		// Process in batches of 10
		const batchSize = 10;
		let savedCount = 0;

		for (let i = 0; i < missingPokemon.length; i += batchSize) {
			const batchNumber = Math.floor(i / batchSize) + 1;
			const batch = missingPokemon.slice(i, i + batchSize);
			console.log(`[Batch Start] Starting batch ${batchNumber} with ${batch.length} Pokémon...`);

			const promises = batch.map(async (pokemon) => {
				console.log(`[Pokémon Processing] Processing Pokémon: ${pokemon.name} (ID: ${pokemon.id})`);
				try {
					const response = await fetchWithRetry(pokemon.url);
					const details: PokemonDetails = await response.json();
					console.log(`[Details Fetch Success] Fetched details for ${pokemon.name}`);

					const image = details.sprites.other?.['official-artwork']?.front_default;
					if (image) {
						const pokemonData: Pokemon = { id: pokemon.id, name: pokemon.name, image };
						console.log(`[KV Save] Saving ${pokemon.name} to KV...`);
						await kv.put(`pokemon:${pokemon.id}`, JSON.stringify(pokemonData));
						console.log(`[KV Save Success] Successfully saved ${pokemon.name} to KV`);
						return true; // Success
					} else {
						console.warn(`No image found for ${pokemon.name}`);
						return false; // No image, not saved
					}
				} catch (error) {
					console.error(`Failed to fetch or save ${pokemon.name}:`, error);
					return false; // Failed
				}
			});

			console.log(`[Batch Await] Awaiting batch ${batchNumber} completion...`);
			const results = await Promise.all(promises);
			const successfulSaves = results.filter(Boolean).length;
			savedCount += successfulSaves;

			console.log(
				`[Batch Complete] Saved ${successfulSaves} Pokémon in batch ${batchNumber}. Total saved: ${savedCount}/${totalMissing} (${((savedCount / totalMissing) * 100).toFixed(2)}%)`
			);
		}

		console.log('[Process Complete] All Pokémon have been processed.');

		const totalPokemon = await kv.list({ prefix: 'pokemon:' });
		await kv.put('total_pokemon', totalPokemon.keys.length.toString());
		console.log(`[Total Update] Updated total_pokemon to ${totalPokemon.keys.length}`);

		return json({ message: 'Pokémon data saved successfully', saved: savedCount, totalMissing });
	} catch (error) {
		console.error('Error fetching or saving Pokémon data:', error);
		return json({ error: 'Failed to fetch or save Pokémon data' }, { status: 500 });
	}
};
