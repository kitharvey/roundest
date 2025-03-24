<script lang="ts">
	let {
		src,
		alt,
		class: className = '',
		...rest
	} = $props<{
		src: string;
		alt: string;
		class?: string;
	}>();

	const baseURL = '/cdn-cgi/image/';

	let optimizedDefaultUrl = $derived(
		import.meta.env.DEV
			? src
			: `${baseURL}${[`width=96`, `height=96`, 'quality=70', 'format=webp']
					.filter(Boolean)
					.join(',')}/${encodeURIComponent(src)}`
	);

	let srcset = $derived(
		import.meta.env.DEV
			? ''
			: `${baseURL}width=96,height=96,quality=70,format=webp/${encodeURIComponent(src)} 96w`
	);

	function handleError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.src = src;
	}
</script>

<picture>
	{#if !import.meta.env.DEV && srcset}
		<source type="image/webp" {srcset} sizes="96px" />
	{/if}
	<img
		src={optimizedDefaultUrl}
		{alt}
		class={className}
		loading="eager"
		decoding="auto"
		{...rest}
		onerror={handleError}
	/>
</picture>

<style>
	img {
		width: 200px;
		height: 200px;
		object-fit: contain;
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
		image-rendering: pixelated;
	}
</style>
