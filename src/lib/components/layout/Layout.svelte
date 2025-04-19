<script lang="ts">
	import '$lib/styles/index.css';
	import { authClient } from '$lib/auth/client';
	import BaseHead from './BaseHead.svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const signOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/');
				}
			}
		});
	};

	let session = $derived(authClient.useSession());
</script>

<svelte:head>
	<title>Roundest</title>
</svelte:head>
<BaseHead />
<header>
	<div class="header-content">
		<nav>
			<a href="/">
				<span>Roundest</span>
			</a>
			<div class="menu">
				<a href="/vote">Vote</a>
				<a href="/results">Results</a>
				{#if $session.data}
					<a href="/pokemon">Pokemons</a>
					<button onclick={signOut}> Logout </button>
				{/if}
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
		height: 50px;
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

	a,
	button {
		font-family: var(--font-fam);
		text-decoration: none;
		color: var(--text-primary);
		font-weight: 700;
		line-height: 1.2;
		transition: color 0.3s ease;
		cursor: pointer;
		background: none;
		outline: none;
		border: none;
		font-size: 1rem;
	}

	a:hover,
	button:hover {
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

	@media (max-width: 768px) {
		nav {
			align-items: center;
		}

		nav span {
			font-size: 1.2rem;
		}

		.menu {
			gap: 0.5rem;
			align-items: center;
		}

		.menu a {
			font-size: 0.9rem;
		}
	}
</style>
