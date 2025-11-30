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
                const parsedBody = (await request.json()) as unknown;
                if (!parsedBody || typeof parsedBody !== 'object') {
                        throw error(400, 'Invalid request body');
                }

                const { post_id, display_order, custom_description } = parsedBody as Record<string, unknown>;

                if (typeof post_id !== 'string' || post_id.trim().length === 0) {
                        throw error(400, 'post_id is required');
                }

                if (display_order !== undefined && typeof display_order !== 'number') {
                        throw error(400, 'display_order must be a number');
                }

                if (custom_description !== undefined && typeof custom_description !== 'string') {
                        throw error(400, 'custom_description must be a string');
                }

                await addFeaturedProject(
                        platform.env.DB,
                        post_id,
                        typeof display_order === 'number' ? display_order : 0,
                        custom_description
                );

		// Fetch and return the newly created featured project
		const featured = await getFeaturedProjects(platform.env.DB, true);
		const newFeatured = featured.find((f) => f.post_id === post_id);

		return json(newFeatured);
        } catch (err) {
                console.error('Failed to add featured project:', err);
                throw error(500, err instanceof Error ? err.message : 'Failed to add featured project');
        }
};
