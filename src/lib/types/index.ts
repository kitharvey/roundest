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

export interface PokemonResponse {
	name: string;
	url: string;
}

interface PokemonTypeRaw {
	name: string;
	url: string;
}

interface PokemonTypesRaw {
	slot: number;
	type: PokemonTypeRaw;
}

export interface PokemonDetails {
	id: number;
	sprites: {
		other?: {
			'official-artwork': {
				front_default: string;
			};
		};
	};
	types: PokemonTypesRaw[];
}

// Result type for the function
export interface GetPokemonsResult {
	message: string;
	saved: number;
	total: number;
	offset: number;
	limit: number;
	logs: string[];
}
