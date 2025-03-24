<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { total } = $derived(data);
	let loading = $state(false);
	let limit = $state(25);
	let logs = $state<string[]>([]);

	const handleAddMore: SubmitFunction = () => {
		loading = true;
		return async ({ update, result }) => {
			if (result.type === 'success') {
				logs = result?.data?.logs;
			}
			loading = false;
			await update();
		};
	};
</script>

<form method="POST" use:enhance={handleAddMore} class="form-container">
	<input type="hidden" name="offset" value={total} />
	<div class="input-group">
		<label for="limit">Number of Pokemon to add:</label>
		<input
			type="number"
			id="limit"
			name="limit"
			bind:value={limit}
			min="1"
			max="100"
			class="limit-input"
		/>
	</div>
	<button type="submit" disabled={loading} class="add-button">
		{#if loading}
			Loading...
		{:else}
			Add More Pokemon ({total} Pokemons saved)
		{/if}
	</button>

	{#if logs.length > 0}
		<div class="logs">
			{#each logs as log}
				<div class="log-entry">{log}</div>
			{/each}
		</div>
	{/if}
</form>

<style>
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
		margin: 1rem auto;
		padding: 1rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.limit-input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
	}

	.add-button {
		background-color: #4caf50;
		color: white;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s;
	}

	.add-button:hover:not(:disabled) {
		background-color: #45a049;
	}

	.add-button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.logs {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background-color: #f9f9f9;
		max-height: 300px;
		overflow-y: auto;
	}

	.log-entry {
		font-family: monospace;
		padding: 0.25rem 0;
		font-size: 0.9rem;
	}
</style>
