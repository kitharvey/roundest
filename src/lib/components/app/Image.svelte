<script lang="ts">
	type ImageVariant = 'thumbnail' | 'card';
	type CloudflareFit = 'cover' | 'contain' | 'scale-down';
	type CloudflareGravity = 'auto' | 'center' | string;

	let {
		src,
		alt,
		variant = 'card' as ImageVariant,
		class: className = '',
		loading = 'lazy' as 'lazy' | 'eager' | 'auto',
		decoding = 'async' as 'async' | 'sync' | 'auto',
		...rest
	} = $props<{
		src: string;
		alt: string;
		variant?: ImageVariant;
		class?: string;
		loading?: 'lazy' | 'eager' | 'auto';
		decoding?: 'async' | 'sync' | 'auto';
	}>();

	const baseURL = '/cdn-cgi/image/';

	type VariantConfig = {
		widths: number[];
		defaultWidth: number;
		sizes: string;
		fit?: CloudflareFit;
		gravity?: CloudflareGravity;
	};

	let variantConfig = $state<VariantConfig>({
		widths: [200],
		defaultWidth: 200,
		sizes: '200px'
	});

	$effect(() => {
		switch (variant) {
			case 'thumbnail':
				variantConfig = {
					widths: [50, 100],
					defaultWidth: 100,
					sizes: '100px',
					fit: 'cover',
					gravity: 'auto'
				};
				break;

			case 'card':
				variantConfig = {
					widths: [100, 200],
					defaultWidth: 200,
					sizes: '200px',
					fit: 'scale-down'
				};
				break;
		}
	});

	let optimizedDefaultUrl = $derived(
		import.meta.env.DEV
			? src
			: `${baseURL}${[
					`width=${variantConfig.defaultWidth}`,
					variantConfig.fit === 'cover' && `height=${variantConfig.defaultWidth}`,
					`fit=${variantConfig.fit}`,
					variantConfig.gravity && `gravity=${variantConfig.gravity}`,
					'quality=75',
					'format=webp'
				]
					.filter(Boolean)
					.join(',')}/${encodeURIComponent(src)}`
	);

	let srcset = $derived(
		import.meta.env.DEV
			? `${src} ${variantConfig.defaultWidth}w`
			: variantConfig.widths
					.map((width) => {
						const params = [
							`width=${width}`,
							variantConfig.fit === 'cover' && `height=${width}`,
							`fit=${variantConfig.fit}`,
							variantConfig.gravity && `gravity=${variantConfig.gravity}`,
							'quality=75',
							'format=webp'
						]
							.filter(Boolean)
							.join(',');
						return `${baseURL}${params}/${encodeURIComponent(src)} ${width}w`;
					})
					.join(', ')
	);

	let fallbackAttempted = false; // Track fallback state

	function handleError(event: Event) {
		if (fallbackAttempted) return;
		fallbackAttempted = true;

		const img = event.target as HTMLImageElement;
		const picture = img.closest('picture');
		if (picture) {
			picture.querySelectorAll('source').forEach((source) => source.remove());
		}
		img.onerror = null;
		img.src = src;
	}
</script>

<picture>
	<source type="image/webp" {srcset} sizes={variantConfig.sizes} />
	<img
		src={optimizedDefaultUrl}
		{alt}
		class={`${className} ${variant}`}
		{loading}
		{decoding}
		{...rest}
		onerror={handleError}
	/>
</picture>

<style>
	img {
		display: block;
		width: 100%;
		height: auto;
	}
	img.thumbnail {
		max-width: 100px;
		max-height: 100px;
	}

	img.card {
		max-width: 200px;
		max-height: 200px;
	}
</style>
