<script lang="ts">
	import Card from '$lib/components/app/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { pokemons } = $derived(data);
</script>

<main>
	<div class="page">
		<div class="hero-content">
			<h1>Who's Rounder?</h1>
			<p class="subtitle">Vote for the roundest Pokémon!</p>
			<a data-sveltekit-preload-data="hover" href="/vote" class="start-button">Start Voting</a>
		</div>
		<div class="card-background">
			<div class="card-scroller">
				{#each pokemons as pokemon}
					{#if pokemon}
						<Card {pokemon} />
					{/if}
				{/each}
				{#each pokemons as pokemon}
					{#if pokemon}
						<Card {pokemon} />
					{/if}
				{/each}
			</div>
		</div>
	</div>
</main>

<style>
	main {
		overflow: hidden;
		height: 100dvh;
		width: 100%;
	}
	.page {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		height: 100dvh;
		max-width: 1400px;
		margin: 0 auto;
		padding: 3rem 5rem 5rem;
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
		top: -5%;
		right: 0;
		width: 50%;
		height: 120dvh;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-content: flex-start; /* Start from the top for scrolling */
		transform: rotate(15deg); /* Tilt the entire container 5 degrees to the right */
		overflow-y: hidden; /* Prevent overflow from container */
		user-select: none;
	}

	.card-scroller {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		width: 120%;
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
		main {
			overflow: hidden;
		}
		.page {
			padding: 2rem 1rem;
			width: 100%;
		}

		.hero-content {
			max-width: 100%;
			text-align: center;
			width: 100%;
		}

		.hero-content h1 {
			font-size: 2.5rem;
		}

		.hero-content .subtitle {
			font-size: 1rem;
		}

		.card-background {
			opacity: 0.2;
			backdrop-filter: blur(50px);
			width: 100%;
			top: -10%;
			height: 120dvh;
		}
	}
</style>
