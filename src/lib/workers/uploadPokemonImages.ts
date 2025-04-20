import type { GetPokemonsResult, PokemonDetails } from '$lib/types';
import { fetchWithRetry } from './fetchWithRetry';
import { uploadImageToR2 } from './uploadImageToR2';

export async function uploadPokemonImages(
	bucket: R2Bucket | undefined,
	limit = 25,
	offset = 0
): Promise<GetPokemonsResult> {
	const logs: string[] = [];
	let uploadedCount = 0;

	try {
		logs.push(
			`[Upload Start] Uploading images for Pokémon (offset: ${offset}, limit: ${limit})...`
		);

		const response = await fetchWithRetry(
			`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
		);
		const { results }: { results: { name: string; url: string }[] } = await response.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		await Promise.all(
			results.map(async (pokemon) => {
				try {
					const detailsResponse = await fetchWithRetry(pokemon.url);
					const details: PokemonDetails = await detailsResponse.json();
					const sprite = details.sprites.other?.['official-artwork']?.front_default;

					if (sprite && bucket) {
						const key = `pokemon/${details.id}.png`;
						await uploadImageToR2(sprite, bucket, key);
						logs.push(`[Upload] Uploaded image for ${pokemon.name} (ID: ${details.id})`);
						uploadedCount++;
					}
				} catch (error) {
					logs.push(`[Upload Error] Failed to upload image for ${pokemon.name}: ${String(error)}`);
					console.error(`Error uploading image for ${pokemon.name}:`, error);
				}
			})
		);

		return {
			message: 'Pokémon images uploaded successfully',
			saved: uploadedCount,
			total: results.length,
			offset,
			limit,
			logs
		};
	} catch (error) {
		throw new Error(`Failed to upload Pokémon images: ${String(error)}\nLogs: ${logs.join('\n')}`);
	}
}
