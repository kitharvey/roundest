import type { UploadResult } from '$lib/types';

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function uploadImageToR2(
	url: string,
	bucket: R2Bucket,
	key: string,
	maxRetries = 3, // Max number of retries
	initialDelay = 1000 // Initial delay in ms (1 second)
): Promise<UploadResult> {
	let lastError: Error | null = null;
	let currentDelay = initialDelay;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			// 1. Fetch the image
			const response = await fetch(url); // Use standard fetch, retries handled by this loop
			if (!response.ok) {
				// Throw an error to trigger retry for non-2xx responses
				throw new Error(
					`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`
				);
			}

			// 2. Get image data
			const imageData = await response.arrayBuffer();
			if (!imageData || imageData.byteLength === 0) {
				// If data is empty, no point retrying the same URL. Throw specific error.
				throw new Error(`Image data missing or empty for ${url}. Cannot upload.`);
			}

			// 3. Get content type
			const contentType = response.headers.get('content-type') || 'image/png'; // Default if header missing

			// 4. Upload to R2
			await bucket.put(key, imageData, {
				httpMetadata: {
					contentType: contentType,
					// Cache for 1 year, immutable is good for versioned/unique assets
					cacheControl: 'public, max-age=31536000, immutable'
				}
			});

			console.log(`[Attempt ${attempt}] Successfully uploaded ${key}`);
			return { success: true, key }; // Success, exit the function
		} catch (error: unknown) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(
				`[Attempt ${attempt}] Failed to upload ${key}: ${lastError.message}. Retrying in ${currentDelay}ms...`
			);

			if (attempt < maxRetries) {
				await delay(currentDelay);
				currentDelay *= 2; // Exponential backoff
			}
		}
	}

	// If loop finishes without success
	console.error(`Failed to upload ${key} after ${maxRetries} attempts.`);
	return { success: false, key, error: lastError?.message || 'Unknown error after retries' };
}
