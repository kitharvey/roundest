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
</script>

<img
	{src}
	{alt}
	class={`${className} ${variant}`}
	loading="eager"
	decoding="auto"
	{...rest}
	fetchpriority="high"
	crossorigin="anonymous"
	referrerpolicy="no-referrer"
	cache-control="max-age=31536000"
/>

<style>
	img {
		object-fit: contain;
		display: block;
	}

	.card {
		width: 200px;
		height: 200px;
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
		image-rendering: pixelated;
	}

	.thumb {
		width: 100px;
		height: 100px;
	}

	:global(body.dark) .card {
		filter: brightness(1.1);
	}
</style>
