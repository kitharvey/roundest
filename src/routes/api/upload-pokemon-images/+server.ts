import { json, type RequestHandler } from '@sveltejs/kit';

interface UploadResult {
	success: boolean;
	key: string;
	error?: string;
}

// Corrected function: Reads the response into an ArrayBuffer first
async function uploadImageToR2(url: string, bucket: R2Bucket, key: string): Promise<UploadResult> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`
			);
		}

		// --- FIX STARTS HERE ---
		// Read the entire response body into an ArrayBuffer.
		// This provides R2 with data that has a known length.
		const imageData = await response.arrayBuffer();
		if (!imageData || imageData.byteLength === 0) {
			throw new Error(`Image data missing or empty for ${url}`);
		}
		// --- FIX ENDS HERE ---

		const contentType = response.headers.get('content-type') || 'image/png';

		// Upload the ArrayBuffer instead of the response.body stream
		console.log({ imageData });
		await bucket.put(key, imageData, {
			// <--- Use imageData here
			httpMetadata: {
				contentType: contentType
				// Content-Length is automatically handled for ArrayBuffer
			}
		});

		console.log(`Successfully uploaded ${key}`); // Optional logging
		return { success: true, key };
	} catch (error: any) {
		// or error: unknown
		console.error(`Failed to upload ${key}:`, error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return { success: false, key, error: errorMessage };
	}
}

// The GET handler remains largely the same, just ensure type safety if using TS
export const GET: RequestHandler = async (event) => {
	// Assert the type for better type safety if using TS and @cloudflare/workers-types
	const bucket = event.platform?.env?.pokemon_images;

	if (!bucket) {
		console.error("R2 bucket binding 'pokemon_images' not found in platform environment.");
		return json(
			{ error: "R2 bucket binding 'pokemon_images' is not configured." },
			{ status: 500 }
		);
	}

	const baseUrl =
		'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

	// Define the expected shape of objects in the results array more explicitly
	interface ResultItem extends UploadResult {
		id: number;
	}
	const results: ResultItem[] = [];
	const totalPokemon = 10; // Keep it small for testing

	console.log(`Starting Pokémon image upload process for ${totalPokemon} Pokémon...`);

	const uploadPromises: Promise<ResultItem>[] = []; // Add specific type to promise array

	for (let id = 1; id <= totalPokemon; id++) {
		const imageUrl = `${baseUrl}${id}.png`;
		const key = `pokemon/${id}.png`;

		uploadPromises.push(
			uploadImageToR2(imageUrl, bucket, key).then((result) => ({ id, ...result }))
		);
	}

	const settledResults = await Promise.allSettled(uploadPromises);

	settledResults.forEach((settledResult) => {
		if (settledResult.status === 'fulfilled') {
			// settledResult.value is guaranteed to be ResultItem here
			results.push(settledResult.value);
		} else {
			// Log the reason for the promise rejection
			console.error('An upload promise task failed:', settledResult.reason);
			// Optionally, you could try and derive which ID failed if the error
			// originated outside uploadImageToR2's try/catch, although less likely here.
		}
	});

	console.log(
		`Finished Pokémon image upload process. ${results.filter((r) => r.success).length} succeeded, ${results.filter((r) => !r.success).length} failed.`
	);

	return json(results);
};
