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
</script>

<img
	{src}
	{alt}
	class={className}
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
		width: 200px;
		height: 200px;
		object-fit: contain;
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
		image-rendering: pixelated;
	}
</style>
