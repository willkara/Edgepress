import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllProjects } from '$lib/server/db/projects';
import { getSetting } from '$lib/server/db/settings';

export const load: PageServerLoad = async ({ platform }) => {
	// Safe fallback for local development where platform might be undefined
	if (!platform?.env?.DB) {
		console.warn('Platform or DB not available, returning empty projects');
		return {
			projects: [],
			imageHash: '',
			pageTitle: 'Projects',
			pageSubtitle: 'A collection of my work and experiments.'
		};
	}

	try {
		const [projects, pageTitle, pageSubtitle] = await Promise.all([
			getAllProjects(platform.env.DB),
			getSetting(platform.env.DB, 'projects_page_title'),
			getSetting(platform.env.DB, 'projects_page_subtitle')
		]);

		return {
			projects,
			imageHash: platform.env.CF_IMAGES_HASH || '',
			pageTitle: pageTitle || 'Projects',
			pageSubtitle: pageSubtitle || 'A collection of my work and experiments.'
		};
	} catch (err) {
		console.error('Failed to load projects page:', err);
		throw error(500, 'Failed to load projects page');
	}
};
