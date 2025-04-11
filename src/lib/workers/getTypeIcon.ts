import { browser } from '$app/environment';

const getTypeIconUrl = (type: string) => {
	const baseUrl = browser ? window.location.origin : 'https://roundest.pages.dev';
	return `${baseUrl}/typeIcons/${type}.png`;
};

const typeIcons: Record<string, string> = Object.fromEntries(
	[
		'normal',
		'fire',
		'fighting',
		'water',
		'flying',
		'grass',
		'poison',
		'electric',
		'ground',
		'psychic',
		'rock',
		'ice',
		'bug',
		'dragon',
		'ghost',
		'dark',
		'steel',
		'fairy'
	].map((type) => [type, getTypeIconUrl(type)])
);

export const getTypeIcon = (type: string) => {
	return typeIcons[type];
};
