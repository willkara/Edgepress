import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getFeaturedProjects, getUnfeaturedProjectPosts } from '$lib/server/db/featured-projects';
import { getSetting } from '$lib/server/db/settings';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const [featuredProjects, unfeaturedPosts, pageTitle, pageSubtitle, showAll] = await Promise.all(
			[
				getFeaturedProjects(platform.env.DB, true), // Include unfeatured to show all
				getUnfeaturedProjectPosts(platform.env.DB),
				getSetting(platform.env.DB, 'projects_page_title'),
				getSetting(platform.env.DB, 'projects_page_subtitle'),
				getSetting(platform.env.DB, 'projects_page_show_all')
			]
		);

		return {
			featuredProjects,
			unfeaturedPosts,
			settings: {
				pageTitle: pageTitle || 'My Projects',
				pageSubtitle: pageSubtitle || "Explore the things I've built and the problems I've solved.",
				showAll: showAll === '1'
			}
		};
	} catch (err: any) {
		console.error('Failed to load projects:', err);
		throw error(500, 'Failed to load projects');
	}
};
