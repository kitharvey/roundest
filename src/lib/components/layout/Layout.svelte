<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/index.css';

	let { children } = $props();
</script>

<header>
	<div class="header-content">
		<nav>
			<a href="/">
				<h1>Roundest</h1>
			</a>
			<div class="menu">
				<a href="/results">Results</a>
			</div>
		</nav>
	</div>
</header>
<main>
	{@render children()}
</main>

<style>
	.header-content {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
		width: 100%;
	}

	/* Header and Navigation */
	header {
		position: fixed;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		padding: 15px 30px;
		gap: 20px;
		width: 100%;
		background: linear-gradient(
			135deg,
			var(--background-start),
			var(--background-end)
		); /* Dark gray gradient */
		color: var(--text-primary); /* White text */
		box-shadow: var(--card-shadow); /* Dark shadow from theme */
		transition: background 0.3s ease;
		z-index: 1000;
	}

	nav {
		flex-grow: 1;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	nav h1 {
		flex-shrink: 0;
		font-size: 1.3rem; /* Slightly larger for prominence */
		line-height: 1;
	}

	a {
		font-family: var(--font-fam); /* Poppins */
		text-decoration: none;
		color: var(--text-primary); /* White */
		font-weight: 700;
		line-height: 1.2;
		transition: color 0.3s ease;
	}

	a:hover {
		color: var(--accent-secondary); /* Muted gold on hover */
	}

	/* Main Content */
	main {
		background: linear-gradient(
			135deg,
			var(--background-start),
			var(--background-end)
		); /* Dark gray gradient */
		color: var(--text-primary); /* White text */
		min-height: 100vh; /* Remaining space */
	}

	.menu {
		display: flex;
		align-items: center;
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		header {
			padding: 10px 20px;
		}

		.header-content {
			gap: 10px;
		}

		nav {
			gap: 10px;
		}
	}
</style>
