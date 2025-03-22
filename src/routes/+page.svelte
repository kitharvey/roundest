<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/app/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { matchups } = $derived(data);

	$effect(() => {
		console.log({ matchups });
	});
</script>

<div class="matchups">
	{#if matchups}
		<form method="POST" use:enhance>
			<input type="hidden" name="pokemon1_id" value={matchups[0].pokemon1.id} />
			<input type="hidden" name="pokemon2_id" value={matchups[0].pokemon2.id} />
			<div class="matchups">
				<button type="submit" name="winner_id" value={matchups[0].pokemon1.id}>
					<Card pokemon={matchups[0].pokemon1} />
				</button>
				<div class="vs">VS</div>
				<button type="submit" name="winner_id" value={matchups[0].pokemon2.id}>
					<Card pokemon={matchups[0].pokemon2} />
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.matchups {
		display: flex;
		align-items: center;
	}

	.matchups {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
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
</style>
