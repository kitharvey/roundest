<script lang="ts">
	let {
		src,
		alt,
		variant = 'card',
		class: className = '',
		...rest
	} = $props<{
		src: string;
		alt: string;
		variant?: 'card' | 'thumb';
		class?: string;
	}>();

	const isProd = import.meta.env.PROD;
	let size = $derived(variant === 'card' ? '200' : '100');
	let opts = $derived(`width=${size},height=${size},fit=scale-down,format=webp`);

	let transformedSrc = $derived(isProd ? `/cdn-cgi/image/${opts}/${encodeURIComponent(src)}` : src);
</script>

<img
	width={size}
	height={size}
	loading="eager"
	decoding="auto"
	{alt}
	class={`${className} ${variant}`}
	src={transformedSrc}
	{...rest}
	fetchpriority="high"
	crossorigin="anonymous"
	referrerpolicy="no-referrer"
/>

<style>
	img {
		object-fit: contain;
		display: block;
	}

	.card {
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
	}

	:global(body.dark) .card {
		filter: brightness(1.1);
	}
</style>
