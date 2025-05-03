// src/routes/sitemap.xml/+server.ts

import { escapeXml } from '$lib/helpers/escapeXml';
import { SITE_BASE_URL } from '../../constants';

interface SitemapEntry {
	path: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
}

export async function GET() {
	const staticPages: SitemapEntry[] = [
		{
			path: '/',
			changefreq: 'daily',
			priority: 1.0
		},
		{
			path: '/vote',
			changefreq: 'daily',
			priority: 0.9
		},
		{
			path: '/results',
			changefreq: 'weekly',
			priority: 0.8
		}
	];

	const today = new Date().toISOString().split('T')[0];

	const allPages = staticPages.map((page) => ({
		...page,
		lastmod: page.lastmod || today
	}));

	const urlElements = allPages
		.map((page) => {
			const fullUrl = `${SITE_BASE_URL}${page.path}`;
			const escapedUrl = escapeXml(fullUrl);

			// Only include optional elements if they exist
			const lastmodElement = page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : '';
			const changefreqElement = page.changefreq
				? `<changefreq>${page.changefreq}</changefreq>`
				: '';
			const priorityElement =
				page.priority !== undefined ? `<priority>${page.priority.toFixed(1)}</priority>` : '';

			return `
    <url>
        <loc>${escapedUrl}</loc>
        ${lastmodElement}
        ${changefreqElement}
        ${priorityElement}
    </url>`;
		})
		.join('');

	const sitemapXml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlElements}
</urlset>`;

	return new Response(sitemapXml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
