<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { total } = $derived(data);

	let addLoading = $state(false);
	let deleteLoading = $state(false);
	let getLoading = $state(false);

	let limit = $state(25);

	let addLogs = $state<string[]>([]);
	let deleteFeedback = $state<string | null>(null);
	let getFeedback = $state<string | null>(null);

	interface AddActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: {
			logs?: string[];
			message?: string;
		};
	}
	interface DeleteActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: {
			message: string;
			status?: number;
		};
	}
	interface GetActionResult {
		type: 'success' | 'error';
		status?: number;
		data?: {
			pokemon?: unknown;
			message?: string;
		};
	}

	const handleAddMore: SubmitFunction = () => {
		addLoading = true;
		addLogs = [];
		deleteFeedback = null;
		getFeedback = null;
		return async ({ result, update }) => {
			const actionResult = result as AddActionResult; // Type assertion

			if (actionResult.type === 'success' && actionResult.data?.logs) {
				addLogs = actionResult.data.logs;
			} else if (result.type === 'error') {
				console.error('Add action failed:', actionResult);
				addLogs = [
					`Error: ${actionResult.data?.message || `Failed with status ${actionResult.status}`}`
				];
			} else if (actionResult.type === 'failure') {
				console.warn('Add action returned failure status:', actionResult);
				addLogs = [`Action failed with status: ${actionResult.status}`];
			} else {
				console.warn('Add action returned unknown status:', actionResult);
				addLogs = [`Action completed with unknown status: ${actionResult.status}`];
			}
			await update({ reset: false });
			addLoading = false;
		};
	};

	/**
	 * Handles the submission of the 'Delete All Pokémon' form.
	 * Updates loading state and displays feedback message.
	 */
	const handleDelete: SubmitFunction = () => {
		deleteLoading = true;
		deleteFeedback = null;
		addLogs = [];
		getFeedback = null;

		return async ({ result, update }) => {
			const actionResult = result as DeleteActionResult;

			if (actionResult.data?.message) {
				deleteFeedback = actionResult.data.message;
			} else if (actionResult.type === 'failure') {
				deleteFeedback = `Deletion failed. Status: ${actionResult.status}`;
				console.error('Delete action failed or missing message:', actionResult);
			} else if (actionResult.type === 'success') {
				deleteFeedback = 'Deletion successful (no message returned).';
			}

			await update({ reset: false }); // Update page data (e.g., total count)
			deleteLoading = false;
		};
	};

	/**
	 * Handles the submission of the 'Get All Pokémon' form.
	 * Updates loading state and displays feedback or data.
	 */
	const handleGet: SubmitFunction = () => {
		getLoading = true;
		getFeedback = null;
		addLogs = [];
		deleteFeedback = null;

		return async ({ result, update }) => {
			const actionResult = result as GetActionResult;

			if (actionResult.type === 'success') {
				if (actionResult.data?.pokemon) {
					getFeedback = JSON.stringify(actionResult.data.pokemon, null, 2);
				} else {
					getFeedback = 'Get action successful (no data or message returned).';
				}
			} else if (actionResult.type === 'error') {
				getFeedback = `Error getting Pokémon: ${actionResult.data?.message || `Failed with status ${actionResult.status || 'unknown'}`}`;
				console.error('Get action failed:', actionResult);
			} else if (actionResult.type === 'failure') {
				getFeedback = `Get action failed with status: ${actionResult.status}`;
				console.warn('Get action returned failure status:', actionResult);
			} else {
				getFeedback = `Get action completed with unknown status: ${actionResult.status || 'unknown'}`;
				console.warn('Get action returned unknown status:', actionResult);
			}
			await update({ reset: false });
			getLoading = false;
		};
	};
</script>

<div class="form-container">
	<form method="POST" action="?/add" use:enhance={handleAddMore} class="action-form">
		<h2>Add Pokémon</h2>
		<input type="hidden" name="offset" value={total} />
		<div class="input-group">
			<label for="limit">Number to Add:</label>
			<input
				type="number"
				id="limit"
				name="limit"
				bind:value={limit}
				min="1"
				max="100"
				class="limit-input"
				required
				aria-describedby="limit-help"
			/>
			<small id="limit-help">Enter a number between 1 and 100.</small>
		</div>
		<button type="submit" disabled={addLoading} class="button add-button">
			{#if addLoading}
				<span class="spinner" aria-hidden="true"></span> Adding...
			{:else}
				Add {limit} Pokémon ({total} Saved)
			{/if}
		</button>

		{#if addLogs.length > 0}
			<div class="logs feedback-area" aria-live="polite">
				<strong>Add Results:</strong>
				{#each addLogs as log, i (i)}
					<div class="log-entry">{log}</div>
				{/each}
			</div>
		{/if}
	</form>

	<form method="POST" action="?/delete" use:enhance={handleDelete} class="action-form">
		<h2>Manage Pokémon</h2>
		<button type="submit" disabled={deleteLoading} class="button delete-button">
			{#if deleteLoading}
				<span class="spinner" aria-hidden="true"></span> Deleting...
			{:else}
				Delete All Pokémon
			{/if}
		</button>
		{#if deleteFeedback}
			<div class="message feedback-area" aria-live="polite">
				{deleteFeedback}
			</div>
		{/if}
	</form>

	<form method="POST" action="/pokemon?/get" use:enhance={handleGet} class="action-form">
		<button type="submit" disabled={getLoading} class="button get-button">
			{#if getLoading}
				<span class="spinner" aria-hidden="true"></span> Getting...
			{:else}
				Get/Refresh All Pokémon Data
			{/if}
		</button>
		{#if getFeedback}
			<div class="data feedback-area" aria-live="polite">
				<strong>Get Results:</strong>
				<pre>{getFeedback}</pre>
			</div>
		{/if}
	</form>
</div>

<style>
	/* --- Base & Layout --- */
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 2rem; /* Increased gap between forms */
		margin: 0 auto;
		margin-top: 4rem;
		padding: 2rem;
		max-width: 900px; /* Slightly wider */
		border-radius: 8px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}

	.action-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h2 {
		margin: 0 0 0.5rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color, #4a4e57); /* Changed to match theme */
		color: var(--accent-primary, #e67e22); /* Orange accent */
		font-size: 1.3rem;
		text-align: center;
	}

	/* --- Input Group --- */
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-group label {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-secondary, #bdc3c7); /* Lighter grey */ /* Changed to match theme */
	}

	.limit-input {
		padding: 0.75rem;
		border: 2px solid var(--border-color, #4a4e57); /* Changed to match theme */
		border-radius: 4px;
		font-size: 1rem; /* Changed to match theme */
		background-color: var(--input-background, #2c3e50); /* Match container bg */
		color: var(--text-primary, #ecf0f1);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: border-color 0.2s ease;
	}

	.limit-input:focus {
		outline: none;
		border-color: var(--accent-secondary, #e67e22); /* Orange focus */
	}

	#limit-help {
		font-size: 0.85rem;
		color: var(--text-muted, #95a5a6); /* Muted grey */ /* Changed to match theme */
	}

	/* --- Buttons --- */
	.button {
		display: inline-flex; /* Align spinner and text */
		align-items: center;
		justify-content: center;
		gap: 0.5rem; /* Space between spinner and text */
		color: var(--button-text, #ffffff); /* White text */
		padding: 0.8rem 1.5rem;
		border: none;
		border-radius: 5px; /* Changed to match theme */
		cursor: pointer;
		font-size: 1rem;
		font-weight: 700;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease,
			box-shadow 0.2s ease;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
		text-transform: uppercase; /* Uppercase text */ /* Changed to match theme */
		background-color: var(--button-background, #2980b9);
		letter-spacing: 0.5px;
	}

	.button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
	}

	.button:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.button:disabled {
		background-color: var(--disabled-background, #7f8c8d); /* Grey */ /* Changed to match theme */
		color: var(--disabled-text, #bdc3c7);
		cursor: not-allowed;
		box-shadow: none;
	}

	/* Specific Button Colors */
	.add-button:hover:not(:disabled) {
		background-color: var(--button-success-hover, #2ecc71);
	}
	.delete-button:hover:not(:disabled) {
		background-color: var(--button-danger-hover, #e74c3c);
	}

	.get-button:hover:not(:disabled) {
		background-color: var(--button-info-hover, #3498db);
	}

	/* --- Loading Spinner --- */
	.spinner {
		display: inline-block;
		width: 1em;
		height: 1em;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spinner-spin 0.75s linear infinite;
	}

	@keyframes spinner-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* --- Logs & Feedback --- */
	.feedback-area {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid var(--border-color, #4a4e57);
		border-radius: 4px; /* Changed to match theme */
		background-color: var(--background-secondary, #2c3e50); /* Match container */
		color: var(--text-secondary, #bdc3c7);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.feedback-area strong {
		display: block;
		margin-bottom: 0.75rem;
		font-weight: 700;
		color: var(--text-primary, #ecf0f1); /* Clearer label */ /* Changed to match theme */
		border-bottom: 1px solid var(--border-color, #4a4e57);
		padding-bottom: 0.5rem;
	}

	.logs {
		max-height: 300px;
		overflow-y: auto;
	}
	.data {
		max-height: 400px;
		overflow-y: auto;
	} /* Allow scrolling for JSON */

	.log-entry {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.9rem;
		padding: 0.3rem 0;
		border-bottom: 1px dotted var(--border-color, #4a4e57);
		word-wrap: break-word; /* Wrap long log lines */
		color: var(--log-text-color, #ecf0f1); /* Brighter log text */ /* Changed to match theme */
	}
	.log-entry:last-child {
		border-bottom: none;
	}

	.data pre {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.9rem;
		white-space: pre-wrap; /* Wrap lines within pre */
		word-wrap: break-word;
		color: var(--data-text-color, #abebc6); /* Light green for data */ /* Changed to match theme */
		margin: 0; /* Remove default pre margin */
	}

	.message {
		/* For simple text feedback like delete */
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--message-text-color, #ecf0f1);
	}

	.add-button {
		/* Changed to match theme */
		background-color: var(--button-success-bg, #27ae60);
	} /* Green */

	.delete-button {
		/* Changed to match theme */
		background-color: var(--button-danger-bg, #c0392b);
	} /* Red */

	.get-button {
		/* Changed to match theme */
		background-color: var(--button-info-bg, #2980b9);
	} /* Blue */
</style>
