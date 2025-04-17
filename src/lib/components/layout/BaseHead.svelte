<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';

	let title = $derived(
		page.url.pathname === '/'
			? 'Roundest - Vote for the Roundest Pokémon!'
			: page.url.pathname === '/vote'
				? 'Vote - Roundest'
				: page.url.pathname === '/results'
					? 'Results - Roundest'
					: 'Roundest'
	);

	let description = $derived(
		page.url.pathname === '/'
			? 'Discover and vote for the roundest Pokémon! Join the ultimate showdown of spherical cuteness.'
			: page.url.pathname === '/vote'
				? 'Cast your vote for the roundest Pokémon! Help us determine the ultimate champion of roundness.'
				: page.url.pathname === '/results'
					? 'See the current rankings of the roundest Pokémon! Check out who is leading the race for ultimate roundness.'
					: 'Roundest - The ultimate Pokémon roundness competition.'
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.href} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<link rel="canonical" href={page.url.href} />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />
	{#if dev}
		<meta name="robots" content="noindex, nofollow" />
		<meta name="googlebot" content="noindex, nofollow" />
	{/if}
</svelte:head>
