export type PokemonType =
	| 'normal'
	| 'fire'
	| 'fighting'
	| 'water'
	| 'flying'
	| 'grass'
	| 'poison'
	| 'electric'
	| 'ground'
	| 'psychic'
	| 'rock'
	| 'ice'
	| 'bug'
	| 'dragon'
	| 'ghost'
	| 'dark'
	| 'steel'
	| 'fairy';

export interface Pokemon {
	id: number;
	name: string;
	image: string;
	types: PokemonType[];
}

export interface Matchup {
	pokemon1: Pokemon;
	pokemon2: Pokemon;
}

export interface UploadResult {
	success: boolean;
	key: string;
	error?: string;
}
