const typeIcons: Record<string, string> = {
	normal: '/typeIcons/normal.png',
	fire: '/typeIcons/fire.png',
	fighting: '/typeIcons/fighting.png',
	water: '/typeIcons/water.png',
	flying: '/typeIcons/flying.png',
	grass: '/typeIcons/grass.png',
	poison: '/typeIcons/poison.png',
	electric: '/typeIcons/electric.png',
	ground: '/typeIcons/ground.png',
	psychic: '/typeIcons/psychic.png',
	rock: '/typeIcons/rock.png',
	ice: '/typeIcons/ice.png',
	bug: '/typeIcons/bug.png',
	dragon: '/typeIcons/dragon.png',
	ghost: '/typeIcons/ghost.png',
	dark: '/typeIcons/dark.png',
	steel: '/typeIcons/steel.png',
	fairy: '/typeIcons/fairy.png'
};

export const getTypeIcon = (type: string) => {
	return typeIcons[type];
};
