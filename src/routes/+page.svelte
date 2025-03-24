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

<div class="matchups">
	{#each matchups as matchup, index}
		<div class="matchup" class:hidden={index !== 0}>
			<form method="POST" use:enhance={voteEnhance}>
				<input type="hidden" name="pokemon1_id" value={matchup.pokemon1.id} />
				<input type="hidden" name="pokemon2_id" value={matchup.pokemon2.id} />
				<div class="matchup-buttons">
					<button type="submit" name="winner_id" value={matchup.pokemon1.id} disabled={index !== 0}>
						<Card pokemon={matchup.pokemon1} />
					</button>
					<div class="vs">VS</div>
					<button type="submit" name="winner_id" value={matchup.pokemon2.id} disabled={index !== 0}>
						<Card pokemon={matchup.pokemon2} />
					</button>
				</div>
			</form>
		</div>
	{/each}
</div>

<style>
	.matchups {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
	}

	.matchup-buttons {
		display: flex;
		align-items: center;
	}

	.vs {
		margin: 0 20px;
		font-size: 1.5em;
		font-weight: bold;
	}

	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.hidden {
		display: none;
	}
</style>
