<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/app/Card.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { matchups } = $derived(data);

	const voteEnhance: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				const matchup = result?.data?.matchup;
				matchups.shift();
				matchups = [...matchups, ...matchup];
			}
		};
	};
</script>

<div class="page">
	<header>
		<h1>Who's Rounder?</h1>
		<p class="subtitle">Vote for the roundest Pokémon!</p>
	</header>

	<section class="instructions">
		<p>
			Click on the Pokémon you think is rounder. Your votes help determine the ultimate round
			champion!
		</p>
	</section>

	<div class="matchups">
		{#each matchups as matchup, index}
			<div class="matchup" class:hidden={index !== 0}>
				<form method="POST" use:enhance={voteEnhance}>
					<input type="hidden" name="pokemon1_id" value={matchup.pokemon1.id} />
					<input type="hidden" name="pokemon2_id" value={matchup.pokemon2.id} />
					<div class="matchup-buttons">
						<button
							type="submit"
							name="winner_id"
							value={matchup.pokemon1.id}
							disabled={index !== 0}
							aria-label={`Vote for ${matchup.pokemon1.name}`}
						>
							<Card pokemon={matchup.pokemon1} />
						</button>
						<div class="vs">VS</div>
						<button
							type="submit"
							name="winner_id"
							value={matchup.pokemon2.id}
							disabled={index !== 0}
							aria-label={`Vote for ${matchup.pokemon2.name}`}
						>
							<Card pokemon={matchup.pokemon2} />
						</button>
					</div>
				</form>
			</div>
		{/each}
	</div>

	<footer>
		<p class="footer-text">Keep voting to see more matchups!</p>
	</footer>
</div>

<style>
	.page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.2rem;
		opacity: 0.8;
	}

	.instructions {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: var(--text-color);
	}

	.matchups {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 20px;
	}

	.matchup-buttons {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.vs {
		font-size: 1.5em;
		font-weight: bold;
		color: var(--text-color);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
	}

	:global(body.dark) .vs {
		text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.1);
	}

	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition:
			transform 0.2s ease-in-out,
			opacity 0.3s ease;
	}

	button:hover:not(:disabled) {
		transform: scale(1.05);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.hidden {
		display: none;
	}

	footer {
		text-align: center;
		margin-top: 2rem;
		opacity: 0.8;
		color: var(--text-color);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.instructions {
			font-size: 0.9rem;
		}
	}
</style>
