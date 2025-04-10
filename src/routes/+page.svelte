<script lang="ts">
	import Card from '$lib/components/app/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { matchups } = $derived(data);

	let allPokemon = $derived(matchups.flatMap((matchup) => [matchup.pokemon1, matchup.pokemon2]));
</script>

<div class="page">
	<div class="hero-content">
		<h1>Who's Rounder?</h1>
		<p class="subtitle">Vote for the roundest Pokémon!</p>
		<a href="/vote" class="start-button">Start Voting</a>
	</div>
	<div class="card-background">
		<div class="card-scroller">
			<!-- Duplicate the cards to create a seamless loop -->
			{#each allPokemon as pokemon}
				{#if pokemon}
					<Card {pokemon} />
				{/if}
			{/each}
			{#each allPokemon as pokemon}
				{#if pokemon}
					<Card {pokemon} />
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.page {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		height: 100dvh;
		padding: 3rem 5rem;
		background: linear-gradient(135deg, var(--background-start), var(--background-end));
		overflow: hidden; /* Prevent scrolling */
	}

	.hero-content {
		position: relative;
		z-index: 2;
		max-width: 50%;
	}

	.hero-content h1 {
		font-size: 4rem;
		line-height: 1.1;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.hero-content .subtitle {
		font-size: 1.2rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.start-button {
		display: inline-block; /* Ensure <a> behaves like a button */
		background-color: var(--button-background);
		color: var(--button-text);
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 700;
		border-radius: 4px;
		font-family: inherit;
		text-decoration: none; /* Remove underline from <a> */
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.start-button:hover {
		background-color: #a52a2a; /* Lighter red for hover */
	}

	/* Background Cards */
	.card-background {
		position: absolute;
		top: -10%;
		right: 0;
		width: 50%;
		height: 120dvh;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-content: flex-start; /* Start from the top for scrolling */
		transform: rotate(15deg); /* Tilt the entire container 5 degrees to the right */
		overflow: hidden; /* Prevent overflow from container */
	}

	.card-scroller {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		width: 100%;
		animation: scroll 60s linear infinite; /* Infinite scroll animation */
	}

	/* Keyframes for infinite scrolling */
	@keyframes scroll {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-50%); /* Move up by half the container's height */
		}
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.page {
			padding: 2rem;
			min-height: 50vh;
		}

		.hero-content {
			max-width: 100%;
			text-align: center;
		}

		.hero-content h1 {
			font-size: 2.5rem;
		}

		.hero-content .subtitle {
			font-size: 1rem;
		}

		.card-background {
			display: none; /* Hide background cards on mobile */
		}
	}
</style>
