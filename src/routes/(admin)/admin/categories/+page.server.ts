import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getAllCategories } from '$lib/server/db/categories';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const categories = await getAllCategories(platform.env.DB as D1Database, true);

		return {
			categories
		};
	} catch (err) {
		console.error('Failed to load categories:', err);
		throw error(500, 'Failed to load categories');
	}
};
