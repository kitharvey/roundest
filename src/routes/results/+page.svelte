<script lang="ts">
	import Image from '$lib/components/app/Image.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();
	let rankings = $derived(data.rankings);
	let total = $derived(data.total);
	let disabled = $state(false);
	let searchTerm = $state('');

	const loadMoreEnhance: SubmitFunction = async () => {
		disabled = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				const newRankings = result?.data?.rankings;
				rankings = [...rankings, ...newRankings];
				total = result?.data?.total;
			}

			disabled = false;
			await tick();
		};
	};

	function handleSearch() {
		const url = new URL(window.location.href);
		url.searchParams.set('search', searchTerm);
		goto(url.toString());
	}

	function handleClearSearch() {
		searchTerm = '';
		const url = new URL(window.location.href);
		goto(url.pathname);
	}
</script>

<div class="rankings-container">
	<h1>Pokémon Rankings by Winrate</h1>
	<div class="search-container">
		<input type="text" placeholder="Search Pokémon" bind:value={searchTerm} />
		<button onclick={handleSearch}>Search</button>
		<button onclick={handleClearSearch}>Clear</button>
	</div>

	<div class="rankings-list">
		{#each rankings as pokemon, index}
			<div class="pokedex-entry" id={(index + 1).toString()}>
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
	{#if rankings.length < total}
		<form method="POST" use:enhance={loadMoreEnhance}>
			<input type="hidden" name="offset" value={rankings.length || 0} />
			<input type="hidden" name="limit" value={10} />
			<button type="submit" class="load-more-button">Load More</button>
		</form>
	{/if}
</div>

<style>
	.rankings-container {
		max-width: 800px;
		margin: 0 auto;
		padding-top: 5rem;
		padding-bottom: 2rem; /* Added padding bottom for spacing below content */
		min-height: 100dvh;
		box-sizing: border-box; /* Ensure padding is included in height calculation */
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 2.5rem;
		color: var(--text-primary); /* White (#ffffff) */
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Deeper shadow for RPG effect */
	}

	.search-container {
		/* Added styles for the search container */
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
		align-items: center;
	}

	.search-container input[type='text'] {
		/* Added styles for search input */
		padding: 0.5rem 0.8rem;
		border-radius: 4px;
		border: 1px solid var(--border-color, #4a4e57);
		background-color: var(--card-background, #3a3f4b);
		color: var(--text-primary, #ffffff);
		font-size: 1rem;
	}

	.search-container input[type='text']::placeholder {
		color: var(--text-secondary, #b0b3b8);
	}

	/* Style search/clear buttons similarly to Load More */
	.search-container button {
		margin: 0; /* Override default button margin */
		padding: 0.5rem 1rem;
		background-color: var(--accent-primary, #8b0000);
		color: var(--button-text, #ffffff);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s ease; /* Add transition */
	}

	.search-container button:hover {
		background-color: #a30000; /* Slightly lighter red for hover */
	}

	.rankings-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: 2rem;
	}

	.pokedex-entry {
		display: flex;
		align-items: center;
		border: 2px solid var(--border-color, #4a4e57); /* Added default fallback */
		background-color: var(--card-background, #3a3f4b); /* Added default fallback */
		box-shadow: var(--card-shadow, 0 8px 30px rgba(0, 0, 0, 0.3)); /* Added default fallback */
		border-radius: 12px; /* Rounded corners for a card-like look */
		padding: 1rem;
		position: relative;
		overflow: hidden; /* Needed for pseudo-element positioning */
		z-index: 1; /* Ensure content is above pseudo-element */
	}

	/* --- FIXED NESTING --- */
	/* Add a subtle "parchment" texture effect using ::before */
	.pokedex-entry::before {
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
		z-index: -1; /* Position behind content */
	}
	/* --- END FIX --- */

	.rank-badge {
		width: 60px;
		height: 60px;
		min-width: 60px; /* Ensure it doesn't shrink */
		background-color: var(--accent-primary, #8b0000); /* Added default fallback */
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--button-text, #ffffff); /* Added default fallback */
		border: 2px solid var(--border-color, #4a4e57); /* Added default fallback */
		border-radius: 50%;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Deeper shadow */
		margin-right: 1rem;
		flex-shrink: 0; /* Prevent shrinking */
	}

	.rank-badge span {
		font-size: 1.2rem;
		font-weight: 700;
	}

	.pokemon-info {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 1rem;
		min-width: 0; /* Allow shrinking if needed */
	}

	.details {
		flex: 1;
		min-width: 0; /* Allow shrinking if needed */
	}

	.details h2 {
		font-size: 1.2rem;
		color: var(--text-primary, #ffffff); /* Added default fallback */
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Deeper shadow for RPG effect */
		margin-top: 0; /* Reset margin */
		margin-bottom: 0.5rem;
		text-transform: capitalize;
		word-break: break-word; /* Prevent long names overflowing */
	}

	.stats {
		display: flex;
		flex-wrap: wrap; /* Allow stats to wrap on smaller screens */
		gap: 1rem;
	}

	.stat {
		display: flex;
		gap: 0.5rem;
		align-items: baseline; /* Align text nicely */
	}

	.stat .label {
		font-size: 0.9rem;
		color: var(--text-secondary, #b0b3b8); /* Added default fallback */
		white-space: nowrap; /* Prevent label wrapping */
	}

	.stat .value {
		font-size: 0.9rem;
		color: var(--accent-secondary, #d4af37); /* Added default fallback */
		font-weight: 600; /* Make value stand out slightly */
	}

	/* Shared styles for Load More, Search, Clear buttons */
	form[method="POST"] button, /* Target load more button specifically */
    .load-more-button /* Optional: Add a class if needed for more specificity */ {
		display: block;
		margin: 2rem auto 1rem auto; /* Adjusted margin */
		padding: 0.75rem 1.5rem; /* Slightly larger padding */
		background-color: var(--accent-primary, #8b0000); /* Added default fallback */
		color: var(--button-text, #ffffff); /* Added default fallback */
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: background-color 0.2s ease; /* Add transition */
	}

	/* Hover state for Load More button */
	form[method='POST'] button:hover,
	.load-more-button:hover {
		background-color: #a30000; /* Slightly lighter red for hover */
	}

	/* Disabled state for Load More button */
	form[method='POST'] button:disabled,
	.load-more-button:disabled {
		background-color: var(--border-color, #4a4e57);
		cursor: not-allowed;
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.rankings-container {
			padding-top: 4rem; /* Adjust padding */
			padding-left: 1rem;
			padding-right: 1rem;
		}

		h1 {
			font-size: 2rem; /* Adjust title size */
		}

		.search-container {
			flex-direction: column; /* Stack search elements */
			align-items: stretch; /* Make input/buttons full width */
			gap: 0.75rem;
		}

		.search-container input[type='text'] {
			width: auto; /* Allow default stretching */
		}

		.pokedex-entry {
			padding: 0.75rem; /* Adjust padding */
			padding-top: 1rem; /* More space at top for badge */
			align-items: flex-start; /* Align items top */
			position: relative;
		}

		.pokemon-info {
			flex-direction: column; /* Stack image and details */
			align-items: center; /* Center image/details stack */
			text-align: center;
			gap: 0.75rem;
			width: 100%; /* Take full width */
		}

		.details {
			width: 100%; /* Ensure details take full width */
		}

		.details h2 {
			font-size: 1.1rem; /* Adjust heading size */
		}

		.stats {
			flex-direction: row; /* Keep stats in a row initially */
			justify-content: center; /* Center stats */
			gap: 0.8rem; /* Adjust gap */
			flex-wrap: wrap; /* Ensure wrapping */
		}

		.stat {
			gap: 0.3rem; /* Reduce gap in stat */
		}

		.rank-badge {
			width: 45px; /* Slightly larger */
			height: 45px;
			min-width: 45px;
			font-size: 1rem; /* Adjust font size */
			position: absolute; /* Position badge absolutely */
			top: -15px; /* Position slightly outside the top border */
			left: 50%; /* Center horizontally */
			transform: translateX(-50%); /* Precise centering */
			margin-right: 0; /* Remove margin */
			z-index: 2; /* Ensure badge is above ::before */
		}

		.rank-badge span {
			font-size: 1rem;
		}

		/* Adjust button sizes */
		form[method='POST'] button,
		.search-container button {
			padding: 0.6rem 1.2rem;
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		h1 {
			font-size: 1.8rem;
		}

		.pokedex-entry {
			padding: 0.5rem;
			padding-top: 1rem;
		}

		.rank-badge {
			width: 40px;
			height: 40px;
			min-width: 40px;
			top: -12px; /* Adjust position */
		}

		.rank-badge span {
			font-size: 0.9rem;
		}

		.details h2 {
			font-size: 1rem;
		}

		.stats {
			gap: 0.6rem; /* Further reduce gap */
		}

		.stat .label,
		.stat .value {
			font-size: 0.85rem;
		}

		/* Adjust button sizes for very small screens */
		form[method='POST'] button,
		.search-container button {
			padding: 0.5rem 1rem;
			font-size: 0.85rem;
		}

		.pokemon-info :global(img.thumb) {
			/* Target image using :global */
			width: 60px; /* Reduce image size */
			height: 60px;
		}
	}
</style>
