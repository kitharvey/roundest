// src/routes/rss.xml/+server.ts

import {
	HOME_DESCRIPTION,
	RESULTS_DESCRIPTION,
	SITE_NAME,
	VOTE_DESCRIPTION,
	HOME_TITLE,
	VOTE_TITLE,
	RESULTS_TITLE,
	SITE_BASE_URL // Assuming SITE_BASE_URL is like 'https://roundest.pokemon.dev'
} from '../../contants'; // Adjust path if needed

const feedItems = [
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
].map((item) => ({ ...item, link: new URL(item.link, SITE_BASE_URL).href }));

function escapeXml(unsafe: string): string {
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return '&apos;';
			case '"':
				return '&quot;';
			default:
				return c;
		}
	});
}

export async function GET() {
	const itemsXml = feedItems
		.map(
			(item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>`
		)
		.join('');

	const channelXml = `
    <channel>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_BASE_URL}</link>
      <description>${escapeXml(HOME_DESCRIPTION)}</description>
      <language>en-us</language>
      <lastBuildDate>${new Date(Math.max(...feedItems.map((item) => item.pubDate.getTime()))).toUTCString()}</lastBuildDate>
      <atom:link href="${SITE_BASE_URL}/rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>
      ${itemsXml}
    </channel>`;

	// Add the <?xml-stylesheet ...?> processing instruction here
	const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss-style.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  ${channelXml}
</rss>`;

	return new Response(rssXml.trim(), {
		headers: {
			'Content-Type': 'application/rss+xml',
			'Cache-Control': 'public, max-age=600'
		}
	});
}
