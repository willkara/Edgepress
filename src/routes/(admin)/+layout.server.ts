import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	// If not authenticated and not on login page, redirect to login
	if (!locals.user && url.pathname !== '/login') {
		throw redirect(303, '/login');
	}

	// If authenticated and on login page, redirect to dashboard
	if (locals.user && url.pathname === '/login') {
		throw redirect(303, '/admin');
	}

	return {
		user: locals.user
	};
};
