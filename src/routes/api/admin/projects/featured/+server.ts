import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addFeaturedProject, getFeaturedProjects } from '$lib/server/db/featured-projects';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const { post_id, display_order, custom_description } = await request.json();

		if (!post_id) {
			throw error(400, 'post_id is required');
		}

		await addFeaturedProject(
			platform.env.DB,
			post_id,
			display_order ?? 0,
			custom_description
		);

		// Fetch and return the newly created featured project
		const featured = await getFeaturedProjects(platform.env.DB, true);
		const newFeatured = featured.find((f) => f.post_id === post_id);

		return json(newFeatured);
	} catch (err: any) {
		console.error('Failed to add featured project:', err);
		throw error(500, err.message || 'Failed to add featured project');
	}
};
