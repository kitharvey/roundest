// src/routes/robots.txt/+server.ts (or .js)

import { SITE_BASE_URL } from '../../constants';

export async function GET() {
	const robotsContent = `
User-agent: *
Allow: /

Sitemap: ${SITE_BASE_URL}/sitemap.xml
`.trim();

	return new Response(robotsContent, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400' // Cache for 1 day (adjust as needed)
		}
	});
}
