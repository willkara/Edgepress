import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reorderProjects } from '$lib/server/db/projects';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { updates } = await request.json();

		if (!Array.isArray(updates)) {
			throw error(400, 'Invalid updates format');
		}

		await reorderProjects(platform!.env.DB, updates);

		return json({ success: true });
	} catch (err: any) {
		console.error('Failed to reorder projects:', err);
		throw error(500, err.message || 'Failed to reorder projects');
	}
};
