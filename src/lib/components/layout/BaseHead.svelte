<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import {
		DEFAULT_OG_IMAGE,
		HOME_DESCRIPTION,
		RESULTS_DESCRIPTION,
		SITE_NAME,
		THEME_COLOR,
		TWITTER_HANDLE,
		VOTE_DESCRIPTION,
		HOME_TITLE,
		VOTE_TITLE,
		RESULTS_TITLE
	} from '../../../contants';

	let title = $derived(
		page.url.pathname === '/'
			? HOME_TITLE
			: page.url.pathname === '/vote'
				? VOTE_TITLE
				: page.url.pathname === '/results'
					? RESULTS_TITLE
					: SITE_NAME
	);

	let description = $derived(
		page.url.pathname === '/'
			? HOME_DESCRIPTION
			: page.url.pathname === '/vote'
				? VOTE_DESCRIPTION
				: page.url.pathname === '/results'
					? RESULTS_DESCRIPTION
					: HOME_DESCRIPTION
	);

	let canonicalUrl = $derived(page.url.href);

	let jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: SITE_NAME,
			url: canonicalUrl,
			description: description
		})
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="canonical" href={canonicalUrl} />
	<meta name="theme-color" content={THEME_COLOR} />

	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<meta name="msapplication-TileColor" content={THEME_COLOR} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:image" content={DEFAULT_OG_IMAGE} />
	<meta property="og:image:width" content="475" />
	<meta property="og:image:height" content="475" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
	{#if TWITTER_HANDLE}
		<meta name="twitter:site" content={TWITTER_HANDLE} />
	{/if}

	{#if dev}
		<meta name="robots" content="noindex, nofollow" />
		<meta name="googlebot" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
		<meta name="googlebot" content="index, follow" />
	{/if}

	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
