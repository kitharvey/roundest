import { SITE_BASE_URL } from '../../contants';

const staticPages: string[] = ['/', '/vote', '/results'];

export async function GET() {
	const allPaths = staticPages;

	const urlElements = allPaths
		.map((path) => {
			const fullUrl = `${SITE_BASE_URL}${path}`;
			const lastmod = new Date().toISOString().split('T')[0];
			const changefreq = 'weekly';
			const priority = path === '/' ? '1.0' : '0.8';

			const escapedUrl = fullUrl
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&apos;');

			return `
    <url>
        <loc>${escapedUrl}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;
		})
		.join('');

	const sitemapXml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlElements}
</urlset>`.trim();

	return new Response(sitemapXml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=600' // Adjust cache duration as needed
		}
	});
}
