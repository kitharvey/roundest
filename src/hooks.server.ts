import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.matchups = null;
	const response = await resolve(event);
	return response;
};
