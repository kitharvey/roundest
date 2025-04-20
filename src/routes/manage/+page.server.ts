import { count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { pokemon as pokemonSchema, votes as votesSchema } from '$lib/server/db/schema';
import { getPokemons } from '$lib/workers/getPokemons';
import { uploadPokemonImages } from '$lib/workers/uploadPokemonImages';
import { getImageCount } from '$lib/workers/getImageCount';

export const load: PageServerLoad = async ({ platform, locals: { db } }) => {
	const totalResult = await db.select({ count: count() }).from(pokemonSchema);
	const totalPokemons = totalResult[0]?.count || 0;

	const bucket = platform?.env?.pokemon_images;
	if (!bucket) {
		return { error: 'R2 bucket not found' };
	}
	const { count: totalImages } = await getImageCount(bucket, 'pokemon/', ['.png']);
	return { totalPokemons, totalImages };
};

export const actions: Actions = {
	'add-pokemons': async ({ request, locals: { db } }) => {
		const data = await request.formData();
		const limit = Number(data.get('limit'));
		const offset = Number(data.get('offset'));
		const { logs } = await getPokemons(db, limit, offset);
		return { logs };
	},
	'delete-pokemons': async ({ locals: { db } }) => {
		await db.delete(votesSchema);
		await db.delete(pokemonSchema);
		return { message: 'All Pokémon data deleted successfully' };
	},
	'get-pokemons': async ({ locals: { db } }) => {
		const pokemonData = await db.select().from(pokemonSchema);
		return { pokemon: pokemonData, total: pokemonData.length };
	},
	'upload-images': async ({ request, platform }) => {
		const bucket = platform?.env?.pokemon_images;
		if (!bucket) {
			return { error: 'R2 bucket not found' };
		}
		const data = await request.formData();
		const limit = Number(data.get('limit'));
		const offset = Number(data.get('offset'));
		const result = await uploadPokemonImages(bucket, limit, offset);
		return result;
	},
	'delete-images': async ({ platform }) => {
		const bucket = platform?.env?.pokemon_images;
		if (!bucket) {
			return { error: 'R2 bucket not found' };
		}
		const list = await bucket.list({ prefix: 'pokemon/' });
		await Promise.all(list.objects.map((obj) => bucket.delete(obj.key)));
		return { message: 'All images deleted successfully' };
	}
};
