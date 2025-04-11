<script lang="ts">
	import { getBGColor } from '$lib/workers/getBGColor';
	import Image from './Image.svelte';
	import { getTypeIcon } from '$lib/workers/getTypeIcon';
	import type { Pokemon } from '$lib/types';

	let { pokemon, className }: { pokemon: Pokemon; className?: string } = $props();

	let formattedName = $derived(pokemon.name.replaceAll('-', ' '));

	// Maintain type-based gradient, but blend with a dark overlay to fit the theme
	let bgColor = $derived(`background-color:  ${getBGColor(pokemon.types[0])}90 `);

	let types = $derived(pokemon.types ?? []);

	let formattedId = $derived(`#${pokemon.id.toString().padStart(3, '0')}`);
</script>

<div class={`card-container ${className}`}>
	<div class="card" style={bgColor}>
		<span class="id-number">{formattedId}</span>

		<div class="image-frame">
			<Image src={pokemon.image} alt={formattedName} variant="card" />
		</div>

		<div>
			<div class="types-container">
				{#each types as type}
					<div class="type-icon-wrapper" title={type}>
						<Image
							src={getTypeIcon(type)}
							class="type-icon"
							style={types.length > 1 ? 'margin: 0 -5px' : 'margin: 0'}
							alt={type}
							variant="icon"
						/>
					</div>
				{/each}
			</div>
			<span class="name">{formattedName}</span>
		</div>
	</div>
</div>

<style lang="scss">
	.card-container {
		width: 250px;
		aspect-ratio: 5 / 7;
		padding: 4px; /* Slightly thicker padding for a "frame" effect */
		border: 2px solid var(--border-color); /* Darker gray border (#4a4e57) */
		border-radius: 16px; /* Slightly smaller radius for a more "ancient" look */
		box-shadow: var(--card-shadow); /* Theme shadow (0 8px 30px rgba(0, 0, 0, 0.3)) */
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		position: relative;
	}

	.card {
		height: 100%;
		width: 100%;
		padding: 15px;
		border-radius: 12px; /* Adjusted to fit within container */
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		text-align: center;
		z-index: 2; /* Ensure content is above the texture */
	}

	.id-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--text-primary); /* Soft gray (#b0b3b8) for a subtle effect */
		z-index: 3;
		line-height: 1.2;
		font-family: var(--font-fam);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Add depth */
	}

	.image-frame {
		width: 100%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 3;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.name {
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1.1;
		text-transform: capitalize;
		color: var(--text-primary); /* White (#ffffff) */
		z-index: 3;
		position: relative;
		font-family: var(--font-fam);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Add depth */
		@media screen and (min-width: 640px) {
			font-size: 1.6rem;
		}
	}

	.types-container {
		display: flex;
		justify-content: center;
		align-items: center;
		bottom: 15px;
		z-index: 3;
	}

	.type-icon-wrapper {
		display: inline-flex;
		/* Add a subtle background to make icons pop */
		border-radius: 50%;
		padding: 4px;
	}

	@media (max-width: 768px) {
		.mobile {
			width: 100%;
			height: 100%;
			aspect-ratio: unset;
		}
	}
</style>
