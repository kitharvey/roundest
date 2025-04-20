import type { UploadResult } from '$lib/types';

export async function uploadImageToR2(
	url: string,
	bucket: R2Bucket,
	key: string
): Promise<UploadResult> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`
			);
		}

		const imageData = await response.arrayBuffer();
		if (!imageData || imageData.byteLength === 0) {
			throw new Error(`Image data missing or empty for ${url}`);
		}

		const contentType = response.headers.get('content-type') || 'image/png';

		await bucket.put(key, imageData, {
			httpMetadata: {
				contentType: contentType,
				cacheControl: 'public, max-age=31536000, immutable'
			}
		});

		console.log(`Successfully uploaded ${key}`); // Optional logging
		return { success: true, key };
	} catch (error: unknown) {
		// or error: unknown
		console.error(`Failed to upload ${key}:`, error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return { success: false, key, error: errorMessage };
	}
}
