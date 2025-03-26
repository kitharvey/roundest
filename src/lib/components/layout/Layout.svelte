<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/index.css';

	let { children } = $props();

	let isDarkMode = $state(false);

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.body.classList.toggle('dark', isDarkMode);
	}

	onMount(() => {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			isDarkMode = true;
		}
		document.body.classList.toggle('dark', isDarkMode);
	});
</script>

<header>
	<nav>
		<a href="/">
			<h1>Roundest</h1>
		</a>
		<a href="/results">Results</a>
	</nav>
	<button onclick={toggleDarkMode}>
		{isDarkMode ? 'Light Mode' : 'Dark Mode'}
	</button>
</header>
<main>
	{@render children()}
</main>

<style>
	/* Header and Navigation */
	header {
		display: flex;
		align-items: center;
		justify-content: space-between; /* Better spacing for header elements */
		padding: 15px 30px; /* Increased padding for a more spacious feel */
		gap: 20px;
		background: var(--primary-color-light); /* Poké Ball red-to-white gradient */
		color: var(--text-color-dark); /* White text for contrast on gradient */
		box-shadow: var(--accent-shadow); /* Pokémon card-like shadow */
		transition: background 0.3s ease;
	}

	nav {
		display: flex;
		align-items: flex-end;
		gap: 30px; /* More spacing between nav items */
	}

	nav h1 {
		flex-shrink: 0;
		font-size: 1.5rem; /* Slightly larger for prominence */
		text-shadow: var(--accent-shadow); /* Shadow for a 3D effect */
		line-height: 1;
	}

	nav a {
		text-decoration: none;
		color: inherit;
		font-weight: 500; /* Slightly bolder for emphasis */
		line-height: 1;
		transition: color 0.3s ease;
	}

	nav a:hover {
		color: var(--secondary-color-dark); /* Pikachu yellow on hover in light mode */
	}

	/* Main Content */
	main {
		padding: 30px; /* More padding for a spacious layout */
		background-color: var(--background-color-light); /* Light cyan background */
		min-height: calc(100vh - 70px); /* Ensure main takes up remaining space */
		transition: background-color 0.3s ease;
	}

	/* Button Styles */
	button {
		flex-shrink: 0;
		padding: 10px 20px; /* Larger padding for a more clickable feel */
		border: none;
		background-color: var(--button-background-light); /* Grass green */
		color: var(--button-text-light); /* White text */
		cursor: pointer;
		font-weight: 600; /* Bolder text for emphasis */
		box-shadow: var(--accent-shadow); /* 3D shadow effect */
		transition:
			background-color 0.3s ease,
			transform 0.1s ease,
			box-shadow 0.3s ease;
	}

	button:hover {
		transform: scale(1.1); /* Slightly larger scale on hover */
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4); /* Deeper shadow on hover */
	}

	button:active {
		transform: scale(0.95); /* Shrink on click */
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); /* Reduced shadow on click */
	}

	/* Dark Mode Styles */
	:global(body.dark) header {
		background: var(--primary-color-dark); /* Red-to-gray gradient for dark mode */
	}

	:global(body.dark) nav a:hover {
		color: var(--secondary-color-dark); /* Brighter Pikachu yellow in dark mode */
	}

	:global(body.dark) main {
		background-color: var(--background-color-dark); /* Dark blue-gray background */
	}

	:global(body.dark) button {
		background-color: var(--button-background-dark); /* Lighter grass green in dark mode */
		color: var(--button-text-dark);
	}
</style>
