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
		front_default?: string;
		[key: string]: any;
	};
}

// Fetch with timeout and retries
async function fetchWithRetry(url: string, retries = 3, timeoutMs = 15000): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			console.log(`[Fetch Attempt] Fetching ${url} (Attempt ${i + 1}/${retries})...`);
			const response = await fetch(url, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			console.log(`[Fetch Success] Fetched ${url}`);
			return response;
		} catch (error) {
			if (i === retries - 1) throw error;
			console.warn(`Retrying fetch for ${url} after error:`, error);
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
		}
	}
	throw new Error('Max retries reached');
}

export const GET: RequestHandler = async ({ platform }) => {
	const logs: string[] = []; // Array to collect logs

	try {
		// Validate KV namespace
		if (!platform?.env?.pokemon) {
			logs.push('[KV Error] KV namespace not found');
			console.error('[KV Error] KV namespace not found');
			return json({ error: 'KV namespace not found', logs }, { status: 500 });
		}

		const kv = platform.env.pokemon;
		logs.push('[Process Start] Syncing Generation 1 Pokémon...');
		console.log('[Process Start] Syncing Generation 1 Pokémon...');

		// Step 2: Fetch Generation 1 Pokémon (IDs 1-151)
		const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151&offset=0');
		if (!listResponse.ok) {
			logs.push(`[List Fetch Error] Failed to fetch Pokémon list: ${listResponse.statusText}`);
			throw new Error(`Failed to fetch Pokémon list: ${listResponse.statusText}`);
		}
		const { results }: { results: PokemonResponse[] } = await listResponse.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);
		console.log(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		// Step 3: Process Pokémon in batches
		let savedCount = 0;
		const batchSize = 10;
		for (let i = 0; i < results.length; i += batchSize) {
			const batch = results.slice(i, i + batchSize);
			logs.push(`[Batch Start] Processing ${batch.length} Pokémon...`);
			console.log(`[Batch Start] Processing ${batch.length} Pokémon...`);

			const promises = batch.map(async (pokemon) => {
				try {
					const response = await fetchWithRetry(pokemon.url);
					const details: PokemonDetails = await response.json();
					let image = details.sprites.front_default;
					if (!image) {
						image =
							(Object.values(details.sprites).find(
								(sprite) => typeof sprite === 'string'
							) as string) || 'https://via.placeholder.com/96';
						logs.push(
							`[Sprite Warning] No front_default for ${pokemon.name}, using fallback: ${image}`
						);
						console.warn(
							`[Sprite Warning] No front_default for ${pokemon.name}, using fallback: ${image}`
						);
					}
					const pokemonData: Pokemon = { id: details.id, name: pokemon.name, image };
					await kv.put(`pokemon:${details.id}`, JSON.stringify(pokemonData));
					logs.push(`[KV Save] Saved ${pokemon.name} (ID: ${details.id})`);
					console.log(`[KV Save] Saved ${pokemon.name} (ID: ${details.id})`);
					return true;
				} catch (error) {
					logs.push(`[Process Error] Failed to process ${pokemon.name}: ${String(error)}`);
					console.error(`[Process Error] Failed to process ${pokemon.name}:`, error);
					return false;
				}
			});

			const batchResults = await Promise.all(promises);
			savedCount += batchResults.filter(Boolean).length;
			logs.push(`[Batch Complete] Saved ${batchResults.filter(Boolean).length} Pokémon in batch.`);
			console.log(
				`[Batch Complete] Saved ${batchResults.filter(Boolean).length} Pokémon in batch.`
			);
		}

		// Step 4: Update total count
		await kv.put('total_pokemon', `${savedCount}`);
		logs.push('[Total Update] Set total_pokemon to 151.');
		console.log('[Total Update] Set total_pokemon to 151.');

		return json({
			message: 'Generation 1 Pokémon processed successfully',
			saved: savedCount,
			total: 151,
			logs // Include logs in the response
		});
	} catch (error) {
		logs.push(`[Process Error] Error in Pokémon sync: ${String(error)}`);
		console.error('[Process Error] Error in Pokémon sync:', error);
		return json({ error: 'Failed to process Pokémon data', logs }, { status: 500 });
	}
};
