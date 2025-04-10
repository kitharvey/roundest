export async function fetchWithRetry(
	url: string,
	retries = 3,
	timeoutMs = 5000
): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				cf: {
					cacheTtl: 300,
					cacheEverything: true
				}
			});
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (i === retries - 1) throw error;
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
		}
	}
	throw new Error('Max retries reached');
}
