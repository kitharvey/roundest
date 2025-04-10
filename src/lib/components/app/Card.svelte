<script lang="ts">
	import { getBGColor } from '$lib/workers/getBGColor';
	import Image from './Image.svelte';
	import { getTypeIcon } from '$lib/workers/getTypeIcon';
	import type { Pokemon } from '$lib/types';

	let { pokemon }: { pokemon: Pokemon } = $props();

	let formattedName = $derived(pokemon.name.replaceAll('-', ' '));

	let bgColor = $derived(
		`background: linear-gradient(0deg, rgba(255,255,255,0.6) 0%, ${
			pokemon.types ? getBGColor(pokemon.types[0]) : 'rgba(255,255,255,0)'
		} 80%, ${pokemon.types ? getBGColor(pokemon.types[0]) : 'rgba(255,255,255,0)'} 100%)`
	);

	let types = $derived(pokemon.types ?? []);

	let formattedId = $derived(`#${pokemon.id.toString().padStart(3, '0')}`);
</script>

<div class="card-container">
	<div class="card" style={bgColor}>
		<span class="id-number">{formattedId}</span>

		<div class="image-frame">
			<Image src={pokemon.image} alt={formattedName} variant="card" />
		</div>

		<span class="name">{formattedName}</span>

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
	</div>
</div>

<style lang="scss">
	.card-container {
		width: 100%;
		max-width: 280px;
		aspect-ratio: 5 / 7;
		padding: 8px;
		background: #f0f0f0;
		border-radius: 24px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.card {
		height: 100%;
		width: 100%;
		padding: 15px;
		border-radius: 18px;
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: flex-end;
		overflow: hidden;
		text-align: center;
	}

	.id-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.4);
		z-index: 1;
	}

	.image-frame {
		width: 100%;
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.name {
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1.1;
		text-transform: capitalize;
		color: #333;
		margin-bottom: 35px;
		z-index: 1;
		position: relative;

		@media screen and (min-width: 640px) {
			font-size: 1.6rem;
		}
	}

	.types-container {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: 15px;
		left: 0;
		right: 0;
		z-index: 3;
	}

	.type-icon-wrapper {
		display: inline-flex;
	}

	.card-container:hover {
		transform: translateY(-5px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
	}
</style>
