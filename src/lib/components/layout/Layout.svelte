<script>
	import { onMount } from 'svelte';
	import '$lib/styles/index.css';
	let isDarkMode = false;

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	}

	onMount(() => {
		if (isDarkMode) {
			document.body.classList.add('dark');
		}
	});
</script>

<div class:dark={isDarkMode}>
	<header>
		<a href="/">
			<h1>Roundest</h1>
		</a>
		<button on:click={toggleDarkMode}>
			{isDarkMode ? 'Light Mode' : 'Dark Mode'}
		</button>
	</header>
	<main>
		<slot />
	</main>
</div>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 20px;
		background-color: var(--primary-color-light);
		color: white;
	}

	.dark header {
		background-color: var(--primary-color-dark);
	}

	main {
		padding: 20px;
	}
</style>
