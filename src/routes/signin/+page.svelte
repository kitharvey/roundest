<script lang="ts">
	import { authClient } from '$lib/auth/client';

	const signIn = async () => {
		const data = await authClient.signIn.social({
			provider: 'github',
			callbackURL: '/'
		});
		console.log(data);
	};
</script>

<main class="container">
	<button onclick={signIn} class="github-button">
		<svg class="github-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.69 3.633 17.297 3.633 17.297c-1.146-.74.086-.735.086-.735 1.27.086 1.937 1.308 1.937 1.308 1.13 1.93 2.964 1.373 3.686 1.05.113-.82.438-1.373.795-1.686-2.783-.315-5.706-1.39-5.706-6.188 0-1.367.488-2.486 1.287-3.363-.13-.316-.557-1.59.12-3.315 0 0 1.05-.338 3.438 1.28a12.07 12.07 0 0 1 3.164-.427c1.074.005 2.157.145 3.164.427 2.386-1.617 3.435-1.28 3.435-1.28.678 1.726.252 2.998.123 3.315.803.877 1.283 1.996 1.283 3.363 0 4.81-2.928 5.87-5.72 6.182.45.39.855 1.16.855 2.34 0 1.69-.015 3.05-.015 3.465 0 .322.218.694.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
			/>
		</svg>
		Sign In with GitHub
	</button>
</main>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100dvh;
		background: linear-gradient(
			135deg,
			var(--background-start),
			var(--background-end)
		); /* Dark gray gradient */
	}

	.github-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background-color: #24292e; /* GitHub dark gray */
		color: var(--button-text); /* White (#ffffff) */
		padding: 0.75rem 1rem;
		border: 2px solid var(--border-color); /* Darker gray border (#4a4e57) */
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 700;
		transition:
			background-color 0.2s,
			transform 0.1s;
		z-index: 1; /* Ensure button is above texture */
	}

	.github-button:hover {
		background-color: #333; /* Slightly lighter gray for hover */
	}

	.github-icon {
		width: 24px;
		height: 24px;
		fill: var(--button-text); /* White (#ffffff) */
	}

	@media (max-width: 600px) {
		.github-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.9rem;
		}

		.github-icon {
			width: 20px;
			height: 20px;
		}
	}
</style>
