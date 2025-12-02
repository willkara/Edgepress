import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getAllInjections } from '$lib/server/db/injections';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const db = platform?.env?.DB;
		if (!db) {
			throw error(500, 'Database not available');
		}

		const injections = await getAllInjections(db);
		return { injections };
	} catch (err: any) {
		console.error('Failed to load injections:', err);
		throw error(500, 'Failed to load injections');
	}
};
