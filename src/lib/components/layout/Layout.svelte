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
		padding: 10px 20px;
		gap: 20px;
		background-color: var(--primary-color-light);
		color: var(--text-color-dark);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: background-color 0.3s ease;
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		width: 100%;
	}

	nav h1 {
		flex-shrink: 0;
	}

	nav a {
		text-decoration: none;
		color: inherit;
	}

	nav a:hover {
		text-decoration: underline;
	}

	/* Main Content */
	main {
		padding: 20px;
	}

	/* Button Styles */
	button {
		flex-shrink: 0;
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		background-color: var(--secondary-color-light);
		color: var(--text-color-dark);
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			transform 0.1s ease;
	}

	button:hover {
		transform: scale(1.05);
	}

	button:active {
		transform: scale(0.95);
	}

	/* Dark Mode Styles */
	:global(body.dark) header {
		background-color: var(--primary-color-dark);
	}

	:global(body.dark) button {
		background-color: var(--secondary-color-dark);
	}
</style>
