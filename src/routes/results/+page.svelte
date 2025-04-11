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
					<Image src={pokemon.image} alt={pokemon.name.replaceAll('-', ' ')} variant="thumb" />
					<div class="details">
						<h2>{pokemon.name.replaceAll('-', ' ')}</h2>
						<div class="stats">
							<div class="stat">
								<span class="label">Wins:</span>
								<span class="value">{pokemon.winCount}</span>
							</div>
							<div class="stat">
								<span class="label">Matches:</span>
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
		padding-top: 5rem;
		min-height: 100dvh;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 2.5rem;
		color: var(--text-primary); /* White (#ffffff) */
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Deeper shadow for RPG effect */
	}

	.rankings-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.pokedex-entry {
		display: flex;
		align-items: center;
		border: 2px solid var(--border-color); /* Darker gray border (#4a4e57) */
		background-color: var(--card-background); /* Slightly lighter than main background (#3a3f4b) */
		box-shadow: var(--card-shadow); /* Theme shadow (0 8px 30px rgba(0, 0, 0, 0.3)) */
		border-radius: 12px; /* Rounded corners for a card-like look */
		padding: 1rem;
		position: relative;
		/* Add a subtle "parchment" texture effect */
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
			background-size: 10px 10px;
			opacity: 0.3;
			pointer-events: none;
			z-index: 0;
		}
	}

	.rank-badge {
		width: 60px;
		height: 60px;
		background-color: var(--accent-primary); /* Deep red (#8b0000) */
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--button-text); /* White (#ffffff) */
		border: 2px solid var(--border-color); /* Darker gray border (#4a4e57) */
		border-radius: 50%;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Deeper shadow */
		margin-right: 1rem;
	}

	.rank-badge span {
		font-size: 1.2rem;
		font-weight: bold;
	}

	.pokemon-info {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 1rem;
	}

	.details {
		flex: 1;
	}

	.details h2 {
		font-size: 1.2rem;
		color: var(--text-primary); /* White (#ffffff) */
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Deeper shadow for RPG effect */
		margin-bottom: 0.5rem;
		text-transform: capitalize;
	}

	.stats {
		display: flex;
		gap: 1rem;
	}

	.stat {
		display: flex;
		gap: 0.5rem;
	}

	.stat .label {
		font-size: 0.9rem;
		color: var(--text-secondary); /* Soft gray (#b0b3b8) */
	}

	.stat .value {
		font-size: 0.9rem;
		color: var(--accent-secondary); /* Muted gold (#d4af37) for values */
	}

	@media (max-width: 768px) {
		.rankings-container {
			padding: 1rem;
		}

		.pokemon-info {
			align-items: flex-start;
		}

		.stats {
			flex-direction: column;
			gap: 0.2rem;
		}

		.rank-badge {
			width: 40px;
			height: 40px;
			margin: 0;
			position: absolute;
			top: 10px;
			right: 10px;
		}

		.rank-badge span {
			font-size: 0.9rem;
		}

		.pokedex-entry {
			padding: 0.5rem;
			gap: 0.5rem;
			align-items: flex-start;
			position: relative;
		}

		.details h2 {
			font-size: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>
