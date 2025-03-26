<script lang="ts">
	import Image from '$lib/components/app/Image.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { rankings } = $derived(data);
</script>

<div class="rankings-container">
	<h1>Pokémon Rankings by Winrate</h1>
	<div class="rankings-list">
		{#each rankings as pokemon, index}
			<div class="pokedex-entry">
				<div class="rank-badge">
					<span>#{index + 1}</span>
				</div>
				<div class="pokemon-info">
					<div class="image-container">
						<Image src={pokemon.image} alt={pokemon.name} variant="thumb" />
					</div>
					<div class="details">
						<h2>{pokemon.name}</h2>
						<div class="stats">
							<div class="stat">
								<span class="label">Wins:</span>
								<span class="value">{pokemon.winCount}</span>
							</div>
							<div class="stat">
								<span class="label">Total Votes:</span>
								<span class="value">{pokemon.totalVotes}</span>
							</div>
							<div class="stat">
								<span class="label">Winrate:</span>
								<span class="value">{pokemon.winRate.toFixed(2)}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.rankings-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		/* Ensure pixelated rendering for the entire container */
		image-rendering: pixelated;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 2rem; /* Adjusted for pixel font */
		text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); /* Pixelated shadow */
	}

	.rankings-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem; /* Space between entries */
	}

	.pokedex-entry {
		display: flex;
		align-items: center;
		/* Pixelated border with Poké Ball red */
		border: 4px solid var(--primary-color-light);
		/* Background inspired by Pokédex entries */
		background-color: #ffffff;
		/* Pixelated shadow */
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
		/* Rounded corners for a card-like look */
		/* Add some padding for spacing */
		padding: 1rem;
	}

	.rank-badge {
		/* Circular badge for the rank */
		width: 60px;
		height: 60px;
		background-color: var(--primary-color-light); /* Pikachu yellow */
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-color-dark);
		/* Pixelated border */
		border: 3px solid var(--pokeball-border);
		border-radius: 50%;
		/* Pixelated shadow */
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
		/* Margin to separate from the info */
		margin-right: 1rem;
	}

	.rank-badge span {
		font-size: 1rem; /* Adjusted for pixel font */
		font-weight: bold;
	}

	.pokemon-info {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 1rem;
	}

	.image-container {
		/* Container for the Pokémon image */
		/* Pixelated border */
		border: 3px solid var(--border-color-light);
		/* Center the image */
		display: flex;
		align-items: center;
		justify-content: center;
		/* Pixelated shadow */
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
	}

	:global(.image-container img) {
		/* Ensure the image renders pixelated */
		image-rendering: pixelated;
	}

	.details {
		flex: 1;
	}

	.details h2 {
		font-size: 1.1rem; /* Adjusted for pixel font */
		color: var(--primary-color-light); /* Poké Ball red */
		text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3); /* Pixelated shadow */
		margin-bottom: 0.5rem;
	}

	.stats {
		display: flex;
		gap: 1rem; /* Space between stats */
	}

	.stat {
		display: flex;
		gap: 0.5rem;
	}

	.stat .label {
		font-size: 0.8rem; /* Adjusted for pixel font */
		color: var(--text-color-light);
	}

	.stat .value {
		font-size: 0.8rem;
		color: var(--button-background-light); /* Grass green for values */
	}

	/* Dark Mode Styles */
	:global(body.dark) .pokedex-entry {
		border-color: var(--primary-color-dark);
		background-color: #333; /* Darker background for dark mode */
		box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.2);
	}

	:global(body.dark) .rank-badge {
		background-color: var(--primary-color-dark); /* Brighter Pikachu yellow */
		box-shadow: 2px 2px 0 rgba(255, 255, 255, 0.2);
		color: var(--text-color-dark);
	}

	:global(body.dark) .image-container {
		border-color: var(--border-color-dark);
		box-shadow: 2px 2px 0 rgba(255, 255, 255, 0.2);
	}

	:global(body.dark) .details h2 {
		color: var(--primary-color-dark);
	}

	:global(body.dark) .stat .label {
		color: var(--text-color-dark);
	}

	:global(body.dark) .stat .value {
		color: var(--button-background-dark); /* Lighter grass green */
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.pokemon-info {
			flex-direction: column;
			align-items: flex-start;
		}

		.image-container {
			width: 60px;
			height: 60px;
		}

		.stats {
			flex-direction: column;
			gap: 0.5rem;
		}

		.rank-badge {
			width: 50px;
			height: 50px;
		}

		.rank-badge span {
			font-size: 0.9rem;
		}
	}
</style>
