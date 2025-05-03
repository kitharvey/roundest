// src/routes/rss.xml/+server.ts

import { escapeXml } from '$lib/helpers/escapeXml';
import {
	HOME_DESCRIPTION,
	RESULTS_DESCRIPTION,
	SITE_NAME,
	VOTE_DESCRIPTION,
	HOME_TITLE,
	VOTE_TITLE,
	RESULTS_TITLE,
	SITE_BASE_URL
} from '../../constants';

interface RssItem {
	title: string;
	link: string;
	description: string;
	pubDate: Date;
	guid?: string;
	author?: string;
	categories?: string[];
	enclosure?: {
		url: string;
		length: number;
		type: string;
	};
}

export async function GET() {
	const feedItems: RssItem[] = [
		{
			title: RESULTS_TITLE,
			link: `/results`,
			description: RESULTS_DESCRIPTION,
			pubDate: new Date('2024-05-01T10:00:00Z')
		},
		{
			title: VOTE_TITLE,
			link: `/vote`,
			description: VOTE_DESCRIPTION,
			pubDate: new Date('2024-04-20T09:00:00Z')
		},
		{
			title: HOME_TITLE,
			link: `/`,
			description: HOME_DESCRIPTION,
			pubDate: new Date('2024-04-15T12:00:00Z')
		}
	].map((item) => ({
		...item,
		link: new URL(item.link, SITE_BASE_URL).href,
		guid: new URL(item.link, SITE_BASE_URL).href
	}));

	// Calculate the latest update time for the feed
	const latestPubDate = new Date(Math.max(...feedItems.map((item) => item.pubDate.getTime())));

	// Generate XML for feed items
	const itemsXml = feedItems
		.map((item) => {
			// Build optional elements
			const categoryElements = item.categories
				? item.categories.map((cat) => `<category>${escapeXml(cat)}</category>`).join('\n      ')
				: '';

			const authorElement = item.author ? `<author>${escapeXml(item.author)}</author>` : '';

			const enclosureElement = item.enclosure
				? `<enclosure url="${escapeXml(item.enclosure.url)}" length="${item.enclosure.length}" type="${escapeXml(item.enclosure.type)}"/>`
				: '';

			return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      ${authorElement}
      ${categoryElements}
      ${enclosureElement}
    </item>`;
		})
		.join('');

	const channelXml = `
    <channel>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_BASE_URL}</link>
      <description>${escapeXml(HOME_DESCRIPTION)}</description>
      <language>en-us</language>
      <lastBuildDate>${latestPubDate.toUTCString()}</lastBuildDate>
      <docs>https://www.rssboard.org/rss-specification</docs>
      <generator>Custom RSS Generator for ${escapeXml(SITE_NAME)}</generator>
      <atom:link href="${SITE_BASE_URL}/rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>
      ${itemsXml}
    </channel>`;

	const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss-style.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  ${channelXml}
</rss>`;

	return new Response(rssXml.trim(), {
		headers: {
			'Content-Type': 'application/rss+xml',
			'Cache-Control': 'public, max-age=3600', // Increased cache time to 1 hour
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
