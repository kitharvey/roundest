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
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
		image-rendering: pixelated;
	}

	.card {
		width: 200px;
		height: 200px;
	}

	.thumb {
		width: 50px;
		height: 50px;
	}
</style>
