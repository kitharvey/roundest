// Define the return type for the count function
type CountResult =
	| { success: true; count: number }
	| { success: false; error: string; count: number };

/**
 * Retrieves the number of images saved in an R2 bucket.
 * @param bucket The R2Bucket instance to query.
 * @param prefix Optional prefix to filter objects (e.g., 'images/').
 * @param extensions Optional array of file extensions to count (e.g., ['.png', '.jpg']).
 * @returns A promise resolving to a CountResult object with the count or an error.
 */
export async function getImageCount(
	bucket: R2Bucket,
	prefix?: string,
	extensions?: string[]
): Promise<CountResult> {
	try {
		let count = 0;
		let cursor: string | undefined = undefined;

		// Loop to handle pagination
		do {
			const listResult = await bucket.list({ prefix, cursor });
			const objects = listResult.objects;

			// Filter objects by extensions if provided, otherwise count all under prefix
			const filteredObjects = extensions
				? objects.filter((obj) =>
						extensions.some((ext) => obj.key.toLowerCase().endsWith(ext.toLowerCase()))
					)
				: objects;

			count += filteredObjects.length;
			cursor = listResult.truncated ? listResult.cursor : undefined;
		} while (cursor);

		return { success: true, count };
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return { success: false, error: errorMessage, count: 0 };
	}
}
