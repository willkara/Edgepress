import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectBySlug } from '$lib/server/db/projects';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';

export const load: PageServerLoad = async ({ params, platform, setHeaders }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const project = await getProjectBySlug(platform.env.DB, params.slug);

		if (!project) {
			throw error(404, 'Project not found');
		}

		// Set cache headers for public project page
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		return {
			project
		};
	} catch (err) {
		if (
			err &&
			typeof err === 'object' &&
			'status' in err &&
			(err as { status: number }).status === 404
		) {
			throw err;
		}
		console.error('Failed to load project page:', err);
		throw error(500, 'Failed to load project page');
	}
};
