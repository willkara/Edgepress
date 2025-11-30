import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeFeaturedProject } from '$lib/server/db/featured-projects';

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
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

		await removeFeaturedProject(platform.env.DB, id);

		return json({ success: true });
        } catch (err) {
                console.error('Failed to remove featured project:', err);
                throw error(500, err instanceof Error ? err.message : 'Failed to remove featured project');
        }
};
