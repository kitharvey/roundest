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
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;
	}
	th,
	td {
		padding: 10px;
		border: 1px solid #ccc;
		text-align: left;
		vertical-align: middle;
	}
	th {
		background-color: #f4f4f4;
	}
</style>
