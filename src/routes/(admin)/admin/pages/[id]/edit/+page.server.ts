import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPageById } from '$lib/server/db/pages';

export const load: PageServerLoad = async ({ platform, params }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const page = await getPageById(db, params.id);

		if (!page) {
			throw error(404, 'Page not found');
		}

		return {
			page
		};
	} catch (err: any) {
		if (err.status === 404) {
			throw err;
		}
		console.error('Failed to load page:', err);
		throw error(500, 'Failed to load page');
	}
};
