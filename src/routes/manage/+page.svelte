<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { totalPokemons, totalImages } = $derived(data);

	// State for Pokémon data actions
	let addLoading = $state(false);
	let deleteLoading = $state(false);
	let getLoading = $state(false);

	// State for image actions
	let uploadLoading = $state(false);
	let deleteImagesLoading = $state(false);
	let getImagesLoading = $state(false);

	// Input values
	let limit = $state(25);
	let uploadLimit = $state(25);

	// Feedback states
	let addLogs = $state<string[]>([]);
	let deleteFeedback = $state<string | null>(null);
	let getFeedback = $state<string | null>(null);
	let uploadLogs = $state<string[]>([]);
	let deleteImagesFeedback = $state<string | null>(null);
	let getImagesFeedback = $state<string | null>(null);

	// Action result interfaces
	interface AddActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: { logs?: string[]; message?: string };
	}
	interface DeleteActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: { message: string; status?: number };
	}
	interface GetActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: { pokemon?: unknown; total?: number; message?: string };
	}
	interface UploadActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: { logs?: string[]; message?: string };
	}
	interface DeleteImagesActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: { message?: string; error?: string };
	}
	interface GetImagesActionResult {
		type: 'success' | 'error' | 'failure';
		status?: number;
		data?: { count?: number; error?: string };
	}

	// Submit handlers
	const handleAddMore: SubmitFunction = () => {
		addLoading = true;
		addLogs = [];
		deleteFeedback = null;
		getFeedback = null;
		return async ({ result, update }) => {
			const actionResult = result as AddActionResult;
			if (actionResult.type === 'success' && actionResult.data?.logs) {
				addLogs = actionResult.data.logs;
			} else if (actionResult.type === 'error' || actionResult.type === 'failure') {
				console.error('Add action failed:', actionResult);
				addLogs = [
					`Error: ${actionResult.data?.message || `Failed with status ${actionResult.status || 'unknown'}`}`
				];
			}
			await invalidate('data');
			await update({ reset: false });
			addLoading = false;
		};
	};

	const handleDelete: SubmitFunction = () => {
		deleteLoading = true;
		deleteFeedback = null;
		addLogs = [];
		getFeedback = null;
		return async ({ result, update }) => {
			const actionResult = result as DeleteActionResult;
			if (actionResult.type === 'success') {
				deleteFeedback = actionResult.data?.message || 'Deletion successful.';
			} else if (actionResult.type === 'error' || actionResult.type === 'failure') {
				deleteFeedback = `Error: ${actionResult.data?.message || `Failed with status ${actionResult.status || 'unknown'}`}`;
				console.error('Delete action failed:', actionResult);
			}
			await invalidate('data');
			await update({ reset: false });
			deleteLoading = false;
		};
	};

	const handleGet: SubmitFunction = () => {
		getLoading = true;
		getFeedback = null;
		addLogs = [];
		deleteFeedback = null;
		return async ({ result, update }) => {
			const actionResult = result as GetActionResult;
			if (actionResult.type === 'success') {
				getFeedback = actionResult.data?.pokemon
					? JSON.stringify(actionResult.data.pokemon, null, 2)
					: 'No Pokémon data returned.';
			} else if (actionResult.type === 'error' || actionResult.type === 'failure') {
				getFeedback = `Error: ${actionResult.data?.message || `Failed with status ${actionResult.status || 'unknown'}`}`;
				console.error('Get action failed:', actionResult);
			}
			await update({ reset: false });
			getLoading = false;
		};
	};

	const handleUploadImages: SubmitFunction = () => {
		uploadLoading = true;
		uploadLogs = [];
		return async ({ result, update }) => {
			const actionResult = result as UploadActionResult;
			if (actionResult.type === 'success' && actionResult.data?.logs) {
				uploadLogs = actionResult.data.logs;
			} else if (actionResult.type === 'error' || actionResult.type === 'failure') {
				console.error('Upload images failed:', actionResult);
				uploadLogs = [
					`Error: ${actionResult.data?.message || actionResult.data?.error || `Failed with status ${actionResult.status || 'unknown'}`}`
				];
			}
			await update({ reset: false });
			uploadLoading = false;
		};
	};

	const handleDeleteImages: SubmitFunction = () => {
		deleteImagesLoading = true;
		deleteImagesFeedback = null;
		return async ({ result, update }) => {
			const actionResult = result as DeleteImagesActionResult;
			if (actionResult.type === 'success') {
				deleteImagesFeedback = actionResult.data?.message || 'Images deleted successfully.';
			} else if (actionResult.type === 'error' || actionResult.type === 'failure') {
				deleteImagesFeedback = `Error: ${actionResult.data?.error || actionResult.data?.message || `Failed with status ${actionResult.status || 'unknown'}`}`;
				console.error('Delete images failed:', actionResult);
			}
			await update({ reset: false });
			deleteImagesLoading = false;
		};
	};
</script>

<div class="form-container">
	<div class="section-title">Pokémon Data Management</div>

	<form method="POST" action="?/add-pokemons" use:enhance={handleAddMore} class="action-form">
		<h2>Add Pokémon</h2>
		<input type="hidden" name="offset" value={totalPokemons} />
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
				Add {limit} Pokémon ({totalPokemons} Saved)
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

	<form method="POST" action="?/delete-pokemons" use:enhance={handleDelete} class="action-form">
		<h2>Delete All Pokémon</h2>
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

	<form method="POST" action="?/get-pokemons" use:enhance={handleGet} class="action-form">
		<h2>Get All Pokémon</h2>
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

	<div class="section-title">Pokémon Image Management</div>

	<form method="POST" action="?/upload-images" use:enhance={handleUploadImages} class="action-form">
		<h2>Upload Pokémon Images</h2>

		<div class="input-group">
			<label for="upload-limit">Limit:</label>
			<input
				type="number"
				id="upload-limit"
				name="limit"
				bind:value={uploadLimit}
				min="1"
				max="100"
				class="limit-input"
				required
			/>
		</div>
		<button type="submit" disabled={uploadLoading} class="button upload-button">
			{#if uploadLoading}
				<span class="spinner" aria-hidden="true"></span> Uploading...
			{:else}
				Upload {uploadLimit} Images (Offset: {totalImages})
			{/if}
		</button>
		{#if uploadLogs.length > 0}
			<div class="logs feedback-area" aria-live="polite">
				<strong>Upload Results:</strong>
				{#each uploadLogs as log, i (i)}
					<div class="log-entry">{log}</div>
				{/each}
			</div>
		{/if}
	</form>

	<form method="POST" action="?/delete-images" use:enhance={handleDeleteImages} class="action-form">
		<h2>Delete All Images</h2>
		<button type="submit" disabled={deleteImagesLoading} class="button delete-button">
			{#if deleteImagesLoading}
				<span class="spinner" aria-hidden="true"></span> Deleting...
			{:else}
				Delete All Images
			{/if}
		</button>
		{#if deleteImagesFeedback}
			<div class="message feedback-area" aria-live="polite">
				{deleteImagesFeedback}
			</div>
		{/if}
	</form>
</div>

<style>
	/* Base & Layout */
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin: 0 auto;
		margin-top: 4rem;
		padding: 2rem;
		max-width: 900px;
		border-radius: 8px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--accent-primary, #e67e22);
		border-bottom: 2px solid var(--border-color, #4a4e57);
		padding-bottom: 0.5rem;
	}

	.action-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h2 {
		margin: 0 0 0.5rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color, #4a4e57);
		color: var(--accent-primary, #e67e22);
		font-size: 1.3rem;
		text-align: center;
	}

	/* Input Group */
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-group label {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-secondary, #bdc3c7);
	}

	.limit-input {
		padding: 0.75rem;
		border: 2px solid var(--border-color, #4a4e57);
		border-radius: 4px;
		font-size: 1rem;
		background-color: var(--input-background, #2c3e50);
		color: var(--text-primary, #ecf0f1);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: border-color 0.2s ease;
	}

	.limit-input:focus {
		outline: none;
		border-color: var(--accent-secondary, #e67e22);
	}

	#limit-help {
		font-size: 0.85rem;
		color: var(--text-muted, #95a5a6);
	}

	/* Buttons */
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: var(--button-text, #ffffff);
		padding: 0.8rem 1.5rem;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 700;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease,
			box-shadow 0.2s ease;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
		text-transform: uppercase;
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
		background-color: var(--disabled-background, #7f8c8d);
		color: var(--disabled-text, #bdc3c7);
		cursor: not-allowed;
		box-shadow: none;
	}

	.add-button {
		background-color: var(--button-success-bg, #27ae60);
	}
	.add-button:hover:not(:disabled) {
		background-color: var(--button-success-hover, #2ecc71);
	}

	.delete-button {
		background-color: var(--button-danger-bg, #c0392b);
	}
	.delete-button:hover:not(:disabled) {
		background-color: var(--button-danger-hover, #e74c3c);
	}

	.get-button {
		background-color: var(--button-info-bg, #2980b9);
	}
	.get-button:hover:not(:disabled) {
		background-color: var(--button-info-hover, #3498db);
	}

	.upload-button {
		background-color: var(--button-upload-bg, #f39c12);
	}
	.upload-button:hover:not(:disabled) {
		background-color: var(--button-upload-hover, #e67e22);
	}

	/* Loading Spinner */
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

	/* Logs & Feedback */
	.feedback-area {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid var(--border-color, #4a4e57);
		border-radius: 4px;
		background-color: var(--background-secondary, #2c3e50);
		color: var(--text-secondary, #bdc3c7);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.feedback-area strong {
		display: block;
		margin-bottom: 0.75rem;
		font-weight: 700;
		color: var(--text-primary, #ecf0f1);
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
	}

	.log-entry {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.9rem;
		padding: 0.3rem 0;
		border-bottom: 1px dotted var(--border-color, #4a4e57);
		word-wrap: break-word;
		color: var(--log-text-color, #ecf0f1);
	}
	.log-entry:last-child {
		border-bottom: none;
	}

	.data pre {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.9rem;
		white-space: pre-wrap;
		word-wrap: break-word;
		color: var(--data-text-color, #abebc6);
		margin: 0;
	}

	.message {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--message-text-color, #ecf0f1);
	}
</style>
