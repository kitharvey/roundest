<script lang="ts">
	import type { Pokemon } from '../../../app';
	import Image from './Image.svelte';

	let { pokemon }: { pokemon: Pokemon } = $props();
</script>

<div class="card">
	<Image src={pokemon.image} alt={pokemon.name} />
	<div class="info">
		<h2>{pokemon.name}</h2>
		<p>#{pokemon.id}</p>
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1px solid var(--border-color-light);
		border-radius: 8px;
		padding: 16px;
		margin: 16px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		background-color: #fff;
		width: max-content;
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease,
			background-color 0.3s ease;
	}

	:global(body.dark) .card {
		border-color: var(--border-color-dark);
		background-color: #444;
		box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
	}

	.info {
		text-align: center;
	}

	.info h2 {
		margin: 0;
		font-size: 1.2em;
		margin-bottom: 5px;
	}

	.info p {
		margin: 0;
		font-size: 0.9em;
		color: #666;
	}

	:global(body.dark) .info p {
		color: #ccc;
	}
	:global(body.dark) .info h2 {
		color: #ccc;
	}
</style>
