<script lang="ts">
	let {
		src,
		alt,
		variant = 'card',
		class: className = '',
		style,
		...rest
	} = $props<{
		src: string;
		alt: string;
		variant?: 'card' | 'thumb' | 'icon';
		class?: string;
		style?: string;
	}>();

	const isProd = import.meta.env.PROD;

	let size = $derived(variant === 'card' ? '200' : variant === 'thumb' ? '100' : '32');

	let opts = $derived(
		`width=${size},height=${size},fit=scale-down,compression=fast,slow-connection-quality=50,quality=70,format=webp`
	);

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
	{style}
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

	.type-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: block;
	}
</style>
