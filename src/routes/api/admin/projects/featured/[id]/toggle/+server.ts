import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleFeaturedStatus } from '$lib/server/db/featured-projects';

export const POST: RequestHandler = async ({ params, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const { id } = params;

		if (!id) {
			throw error(400, 'ID is required');
		}

		await toggleFeaturedStatus(platform.env.DB, id);

		return json({ success: true });
	} catch (err: any) {
		console.error('Failed to toggle featured status:', err);
		throw error(500, err.message || 'Failed to toggle featured status');
	}
};
