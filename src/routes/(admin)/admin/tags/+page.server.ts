import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getAllTags } from '$lib/server/db/tags';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const tags = await getAllTags(platform.env.DB as D1Database, true);

		return {
			tags
		};
	} catch (err) {
		console.error('Failed to load tags:', err);
		throw error(500, 'Failed to load tags');
	}
};
