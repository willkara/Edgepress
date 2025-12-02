import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllProjects } from '$lib/server/db/projects';
import { getSetting } from '$lib/server/db/settings';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const [projects, pageTitle, pageSubtitle] = await Promise.all([
			getAllProjects(platform.env.DB as D1Database),
			getSetting(platform.env.DB as D1Database, 'projects_page_title'),
			getSetting(platform.env.DB as D1Database, 'projects_page_subtitle')
		]);

		return {
			projects,
			imageHash: platform.env.CF_IMAGES_HASH,
			pageTitle: pageTitle || 'Projects',
			pageSubtitle: pageSubtitle || 'A collection of my work and experiments.'
		};
	} catch (err) {
		console.error('Failed to load projects page:', err);
		throw error(500, 'Failed to load projects page');
	}
};
