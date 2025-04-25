<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import Card from '$lib/components/app/Card.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import type { Matchup } from '$lib/types';

	let { data }: PageProps = $props();
	let matchups = $state(data.matchups);
	let mainRef = $state<HTMLElement | null>(null);
	let disabled = $state(false);

	const voteEnhance: SubmitFunction = async () => {
		disabled = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				const newMatchup = result?.data?.matchup as Matchup[];
				matchups = [...matchups, ...newMatchup];
				matchups.shift();
			}

			disabled = false;
			await tick();
			mainRef?.focus();
		};
	};
</script>

<div class="page">
	<header>
		<h1>Who's Rounder?</h1>
		<p class="subtitle">Vote for the roundest Pokémon!</p>
	</header>
	<section class="instructions" aria-labelledby="instructions-heading">
		<h2 id="instructions-heading" class="visually-hidden">Instructions</h2>
		<p>
			Click on the Pokémon you think is rounder. Your votes help determine the ultimate round
			champion!
		</p>
	</section>
	<div bind:this={mainRef} tabindex="-1">
		<div class="matchups-container">
			{#if matchups.length > 0}
				{#each matchups as matchup, index (matchup.pokemon1.id + '-' + matchup.pokemon2.id + '-' + index)}
					<div class="matchup" style:display={index === 0 ? null : 'none'}>
						<form method="POST" use:enhance={voteEnhance}>
							<input type="hidden" name="pokemon1_id" value={matchup.pokemon1.id} />
							<input type="hidden" name="pokemon2_id" value={matchup.pokemon2.id} />
							<div class="matchup-buttons">
								<button
									type="submit"
									name="winner_id"
									value={matchup.pokemon1.id}
									disabled={index !== 0 || disabled}
									aria-label={`Vote for ${matchup.pokemon1.name}`}
								>
									<Card pokemon={matchup.pokemon1} className="mobile" />
								</button>
								<div class="vs" aria-hidden="true">VS</div>
								<button
									type="submit"
									name="winner_id"
									value={matchup.pokemon2.id}
									disabled={index !== 0 || disabled}
									aria-label={`Vote for ${matchup.pokemon2.name}`}
								>
									<Card pokemon={matchup.pokemon2} className="mobile" />
								</button>
							</div>
						</form>
					</div>
				{/each}
			{:else}
				<p>No more matchups available!</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.page {
		padding-top: 5rem;
		display: flex;
		flex-direction: column;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1rem 0;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 2.5rem);
		color: var(--text-primary);
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: clamp(1rem, 3vw, 1.2rem);
		color: var(--text-secondary);
	}

	button {
		border: none;
		background: none;
		cursor: pointer;
	}
	button:disabled {
		cursor: progress;
	}

	.instructions {
		text-align: center;
		margin-bottom: 2rem;
		padding: 0 1rem;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.visually-hidden {
		border: 0;
		clip: rect(0 0 0 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		width: 1px;
		white-space: nowrap;
	}

	.matchups-container {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
	}

	.matchup {
		width: 100%;
		display: contents;
	}

	.matchup form {
		position: relative;
		display: contents;
	}

	.matchup-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		width: 100%;
	}

	.vs {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		color: var(--accent-primary);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.page {
			padding: 0;
		}

		header {
			display: none;
		}

		.instructions {
			display: none;
		}

		.matchup-buttons {
			gap: 0;
			flex-direction: column;
			justify-content: space-between;
			overflow: hidden;
			height: calc(100dvh - 50px);
			position: fixed;
			bottom: 0;
			padding: 0.5rem;
		}

		.matchup-buttons button {
			height: calc(50% - 0.25rem);
			width: 100%;
		}

		.vs {
			display: none;
		}
	}
</style>
