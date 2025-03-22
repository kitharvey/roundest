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

	type VariantConfig = {
		width: number;
		sizes: string;
	};

	let variantConfig = $state<VariantConfig>({
		width: 200,
		sizes: '200px'
	});

	let optimizedDefaultUrl = $derived(
		import.meta.env.DEV
			? src
			: `${baseURL}${[`width=${variantConfig.width}`, 'quality=75', 'format=webp']
					.filter(Boolean)
					.join(',')}/${encodeURIComponent(src)}`
	);

	let srcset = $derived(
		import.meta.env.DEV
			? ''
			: [100, 200]
					.map((width) => {
						const params = [`width=${width}`, `height=${width}`, 'quality=75', 'format=webp']
							.filter(Boolean)
							.join(',');
						return `${baseURL}${params}/${encodeURIComponent(src)} ${width}w`;
					})
					.join(', ')
	);

	function handleError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.src = src;
	}
</script>

<picture>
	{#if !import.meta.env.DEV}
		<source type="image/webp" {srcset} sizes={variantConfig.sizes} />
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
		margin-bottom: 10px;
	}
</style>
