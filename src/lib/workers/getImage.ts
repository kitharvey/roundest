const padId = (id: number) => String(id).padStart(3, '0');

export const getImage = (id: number) => {
	return `https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/${padId(id)}.png`;
};
