<script lang="ts">
	import type { Pokemon } from '../../../app';
	import Image from './Image.svelte';

	let { pokemon }: { pokemon: Pokemon } = $props();
</script>

<div class="card">
	<Image src={pokemon.image} alt={pokemon.name} variant="card" />
	<div class="info">
		<h2>{pokemon.name}</h2>
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 4px solid var(--primary-color-light);
		padding: 20px;
		margin: 20px;
		background: var(--background-color-light);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
		width: max-content;
		font-family: 'Press Start 2P', monospace;
	}

	/* Info section */
	.info {
		text-align: center;
		margin-top: 10px; /* More spacing between image and text */
	}

	.info h2 {
		margin: 0;
		font-size: 1.1em; /* Slightly smaller for pixel font readability */
		color: var(--primary-color-light); /* Poké Ball red for the name */
		text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2); /* Pixelated text shadow */
	}

	/* Dark Mode Styles */
	:global(body.dark) .card {
		border-color: var(--primary-color-dark);
		background: var(--background-color-dark);
		box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.2);
	}

	:global(body.dark) .info h2 {
		color: var(--primary-color-dark); /* Poké Ball red in dark mode */
	}

	@media (max-width: 768px) {
		.card {
			margin: 0;
		}
	}
</style>
