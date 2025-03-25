<script lang="ts">
	import Image from '$lib/components/app/Image.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { rankings } = $derived(data);
</script>

<h1>Pokémon Rankings by Winrate</h1>
<table>
	<thead>
		<tr>
			<th>Rank</th>
			<th>Image</th>
			<th>Name</th>
			<th>Wins</th>
			<th>Total Votes</th>
			<th>Winrate (%)</th>
		</tr>
	</thead>
	<tbody>
		{#each rankings as pokemon, index}
			<tr>
				<td>{index + 1}</td>
				<td>
					<Image src={pokemon.image} alt={pokemon.name} variant="thumb" />
				</td>
				<td>{pokemon.name}</td>
				<td>{pokemon.winCount}</td>
				<td>{pokemon.totalVotes}</td>
				<td>{pokemon.winRate.toFixed(2)}%</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	h1 {
		text-align: center;
		margin-bottom: 20px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(body.dark) table {
		background-color: #444;
	}

	th,
	td {
		padding: 10px;
		border: 1px solid var(--border-color-light);
		text-align: left;
		vertical-align: middle;
		color: var(--text-color-light);
	}

	:global(body.dark) th,
	:global(body.dark) td {
		border-color: var(--border-color-dark);
		color: var(--text-color-dark);
	}

	th {
		background-color: var(--background-color-light);
		font-weight: bold;
	}

	:global(body.dark) th {
		background-color: #555;
	}

	tr:hover:not(thead tr) {
		background-color: rgba(0, 0, 0, 0.05);
	}

	:global(body.dark) tr:hover:not(thead tr) {
		background-color: rgba(255, 255, 255, 0.05);
	}
</style>
