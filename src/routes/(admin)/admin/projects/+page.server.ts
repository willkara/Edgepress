import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllProjects } from '$lib/server/db/projects';
import { getSetting } from '$lib/server/db/settings';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		// Defensive return for local dev without D1 binding
		return {
			projects: [],
			imageHash: '',
			settings: {
				pageTitle: 'Projects',
				pageSubtitle: 'Manage your portfolio items'
			}
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
			imageHash: platform.env.CF_IMAGES_HASH,
			settings: {
				pageTitle,
				pageSubtitle
			}
		};
	} catch (err: any) {
		console.error('Failed to load projects:', err);
		throw error(500, 'Failed to load projects');
	}
};
