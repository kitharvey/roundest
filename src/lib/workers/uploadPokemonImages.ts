import type { GetPokemonsResult, PokemonDetails } from '$lib/types';
import { fetchWithRetry } from './fetchWithRetry'; // Assumes this handles retries for API calls
import { uploadImageToR2 } from './uploadImageToR2'; // Use the improved version

export async function uploadPokemonImages(
	bucket: R2Bucket | undefined,
	limit = 25,
	offset = 0
): Promise<GetPokemonsResult> {
	const logs: string[] = [];
	let uploadedCount = 0;
	let failedCount = 0; // Keep track of failures too

	if (!bucket) {
		// Early exit if bucket is not provided
		throw new Error('R2 Bucket is not defined. Cannot upload images.');
	}

	try {
		logs.push(
			`[Upload Start] Uploading images for Pokémon (offset: ${offset}, limit: ${limit})...`
		);

		// Fetch the list of Pokémon (using existing retry logic)
		const response = await fetchWithRetry(
			`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
		);
		const { results }: { results: { name: string; url: string }[] } = await response.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		// --- Sequential Processing Start ---
		// Process each Pokémon one by one to avoid too many subrequests
		for (const pokemon of results) {
			try {
				// Fetch details for the current Pokémon (using existing retry logic)
				const detailsResponse = await fetchWithRetry(pokemon.url);
				const details: PokemonDetails = await detailsResponse.json();
				const sprite = details.sprites.other?.['official-artwork']?.front_default;

				if (sprite) {
					const key = `pokemon/${details.id}.png`; // Define R2 object key

					// Call the improved upload function (handles its own retries)
					const uploadResult = await uploadImageToR2(sprite, bucket, key);

					if (uploadResult.success) {
						logs.push(
							`[Upload Success] Uploaded image for ${pokemon.name} (ID: ${details.id}) to ${key}`
						);
						uploadedCount++;
					} else {
						// Log the failure from the upload function's result
						logs.push(
							`[Upload Failed] Failed to upload image for ${pokemon.name} (ID: ${details.id}): ${uploadResult.error}`
						);
						console.error(`Failed upload for ${pokemon.name}: ${uploadResult.error}`);
						failedCount++;
					}
				} else {
					logs.push(
						`[Skip] No official-artwork sprite found for ${pokemon.name} (ID: ${details.id})`
					);
					// Consider if skipping should count as a failure or just be noted
				}
			} catch (error) {
				// Catch errors specific to fetching details or other issues *within* the loop for one Pokémon
				const errorMessage = error instanceof Error ? error.message : String(error);
				logs.push(`[Processing Error] Failed to process ${pokemon.name}: ${errorMessage}`);
				console.error(`Error processing ${pokemon.name}:`, error);
				failedCount++; // Count this as a failure for the summary
			}
		}
		// --- Sequential Processing End ---

		logs.push(
			`[Upload Complete] Finished processing batch. Uploaded: ${uploadedCount}, Failed/Skipped: ${failedCount}, Total processed: ${results.length}`
		);

		return {
			message: `Pokémon image upload process completed. ${uploadedCount} successful, ${failedCount} failed or skipped.`,
			saved: uploadedCount,
			total: results.length,
			offset,
			limit,
			logs
		};
	} catch (error) {
		// Catch errors related to the *initial* Pokémon list fetch or unexpected setup issues
		const errorMessage = error instanceof Error ? error.message : String(error);
		logs.push(`[Fatal Error] Failed to complete upload batch: ${errorMessage}`);
		// Rethrowing might be appropriate depending on how the caller handles it
		throw new Error(`Failed to upload Pokémon images: ${errorMessage}\nLogs:\n${logs.join('\n')}`);
	}
}
