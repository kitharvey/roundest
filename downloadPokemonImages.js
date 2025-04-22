import fs from 'fs/promises';
import path from 'path';

async function downloadAndSaveImage(spriteUrl, localPath) {
	try {
		const dir = path.dirname(localPath);
		await fs.mkdir(dir, { recursive: true });

		const response = await fetch(spriteUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await fs.writeFile(localPath, buffer);

		return { success: true };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return { success: false, error: errorMessage };
	}
}

export async function downloadPokemonImages(limit = 25, offset = 0) {
	const logs = [];
	let downloadedCount = 0;
	let failedCount = 0;
	const baseDir = path.join(process.cwd(), 'static', 'pokemon');

	try {
		logs.push(
			`[Download Start] Downloading images for Pokémon (offset: ${offset}, limit: ${limit})...`
		);

		// Fetch the list of Pokémon
		const response = await fetch(
			`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
		);
		const { results } = await response.json();
		logs.push(`[List Fetch Success] Fetched ${results.length} Pokémon.`);

		// Process each Pokémon sequentially
		for (const pokemon of results) {
			try {
				const detailsResponse = await fetch(pokemon.url);
				const details = await detailsResponse.json();
				const sprite = details.sprites.other?.['official-artwork']?.front_default;

				if (sprite) {
					const localPath = path.join(baseDir, `${details.id}.png`);
					const downloadResult = await downloadAndSaveImage(sprite, localPath);

					if (downloadResult.success) {
						logs.push(
							`[Download Success] Saved image for ${pokemon.name} (ID: ${details.id}) to ${localPath}`
						);
						downloadedCount++;
					} else {
						logs.push(
							`[Download Failed] Failed to save image for ${pokemon.name} (ID: ${details.id}): ${downloadResult.error}`
						);
						console.error(`Failed download for ${pokemon.name}: ${downloadResult.error}`);
						failedCount++;
					}
				} else {
					logs.push(
						`[Skip] No official-artwork sprite found for ${pokemon.name} (ID: ${details.id})`
					);
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				logs.push(`[Processing Error] Failed to process ${pokemon.name}: ${errorMessage}`);
				console.error(`Error processing ${pokemon.name}:`, error);
				failedCount++;
			}
		}

		logs.push(
			`[Download Complete] Finished processing batch. Downloaded: ${downloadedCount}, Failed/Skipped: ${failedCount}, Total processed: ${results.length}`
		);

		return {
			message: `Pokémon image download process completed. ${downloadedCount} successful, ${failedCount} failed or skipped.`,
			saved: downloadedCount,
			total: results.length,
			offset,
			limit,
			logs
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logs.push(`[Fatal Error] Failed to complete download batch: ${errorMessage}`);
		throw new Error(
			`Failed to download Pokémon images: ${errorMessage}\nLogs:\n${logs.join('\n')}`
		);
	}
}

async function main() {
	const limit = 1025;
	const offset = 151;

	try {
		const result = await downloadPokemonImages(limit, offset);
		console.log(result.message);
		console.log(`Saved: ${result.saved}, Total: ${result.total}`);

		if (result.logs && result.logs.length > 0) {
			console.log('Logs:');
			result.logs.forEach((log) => console.log(log));
		}
	} catch (error) {
		console.error('An error occurred during the download process:', error);
	}
}

main();
