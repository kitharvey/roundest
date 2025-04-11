<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/index.css';

	let { children } = $props();
	let headerRef = $state<HTMLElement | null>(null);
	let mainRef = $state<HTMLElement | null>(null);

	onMount(() => {
		const setPadding = () => {
			if (headerRef && mainRef) {
				const headerHeight = headerRef.offsetHeight;
				mainRef.style.paddingTop = `${headerHeight}px`;
			}
		};
		setPadding(); // Set initial padding
		window.addEventListener('resize', setPadding); // Update on resize
		return () => window.removeEventListener('resize', setPadding); // Cleanup
	});
</script>

<header bind:this={headerRef}>
	<div class="header-content">
		<nav>
			<a href="/">
				<span>Roundest</span>
			</a>
			<div class="menu">
				<a href="/vote">Vote</a>
				<a href="/results">Results</a>
			</div>
		</nav>
	</div>
</header>
<main bind:this={mainRef}>
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
		background: linear-gradient(135deg, var(--background-start), var(--background-end));
		color: var(--text-primary);
		box-shadow: var(--card-shadow);
		transition: background 0.3s ease;
		z-index: 1000;
	}

	nav {
		flex-grow: 1;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	nav span {
		flex-shrink: 0;
		font-size: 1.3rem;
		line-height: 1;
	}

	a {
		font-family: var(--font-fam);
		text-decoration: none;
		color: var(--text-primary);
		font-weight: 700;
		line-height: 1.2;
		transition: color 0.3s ease;
	}

	a:hover {
		color: var(--accent-secondary);
	}

	/* Main Content */
	main {
		background: linear-gradient(135deg, var(--background-start), var(--background-end));
		color: var(--text-primary);
		min-height: 100vh;
	}

	.menu {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		header {
			padding: 20px;
		}

		nav {
			align-items: center;
		}

		.menu {
			gap: 0.5rem;
		}

		nav span {
			font-size: 1.2rem; /* Slightly smaller logo */
		}

		.menu a {
			font-size: 0.9rem; /* Smaller menu items */
		}
	}
</style>
