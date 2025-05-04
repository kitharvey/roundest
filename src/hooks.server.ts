import { GH_USER } from '$env/static/private';
import { getAuth } from '$lib/auth';
import { getDb } from '$lib/server/db';
import { redirect, type Handle, error } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';

const PROTECTED_ROUTE_PREFIX = '/manage';
const LOGIN_ROUTE = '/signin';

const initialize: Handle = async ({ event, resolve }) => {
	if (!event.platform?.env?.DB) {
		console.warn('DB environment variable not found. Skipping DB/Auth initialization.');
		return resolve(event);
	}

	try {
		const db = getDb(event.platform.env.DB);
		const auth = getAuth(db);

		event.locals.db = db;
		event.locals.auth = auth;
		event.locals.session = await auth.api.getSession({ headers: event.request.headers });
	} catch (err) {
		console.error('Failed to initialize DB or Auth:', err);
		throw error(500, 'Server initialization failed');
	}

	return resolve(event);
};

const authorize: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const session = event.locals.session;

	if (pathname.startsWith(PROTECTED_ROUTE_PREFIX)) {
		if (!session || !session.user || session.user.email !== GH_USER) {
			console.log(
				`Unauthorized access attempt to ${PROTECTED_ROUTE_PREFIX} by user ${session?.user?.id ?? 'anonymous'}. Redirecting to login.`
			);

			throw redirect(302, LOGIN_ROUTE);
		}
	}

	return resolve(event);
};

const betterAuthHandler: Handle = async ({ event, resolve }) => {
	if (!event.locals.auth) {
		console.warn('better-auth handler called but event.locals.auth is not set.');
		return resolve(event);
	}

	return svelteKitHandler({
		event,
		resolve,
		auth: event.locals.auth
	});
};

export const handle = sequence(initialize, authorize, betterAuthHandler);
