import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getFeaturedProjects } from '$lib/server/db/featured-projects';
import { getSetting } from '$lib/server/db/settings';
import { getPublishedPosts } from '$lib/server/db/posts';
import { featuredProjectSchema, projectPostSchema, type ProjectPost } from '$lib/types/projects';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
                const [featuredProjectsRaw, pageTitle, pageSubtitle, showAllSetting] = await Promise.all([
                        getFeaturedProjects(platform.env.DB, false), // Only get featured (visible) projects
                        getSetting(platform.env.DB, 'projects_page_title'),
                        getSetting(platform.env.DB, 'projects_page_subtitle'),
                        getSetting(platform.env.DB, 'projects_page_show_all')
                ]);

                const featuredProjects = featuredProjectSchema.array().parse(featuredProjectsRaw);
                const showAll = showAllSetting === '1';

                // If showAll is enabled, also fetch all posts with "Projects" category
                let allProjectPosts: ProjectPost[] = [];
                if (showAll) {
                        const allPosts = projectPostSchema
                                .array()
                                .parse(await getPublishedPosts(platform.env.DB, 100, 0));
                        allProjectPosts = allPosts.filter((post) => post.category_slug === 'projects');
                }

		return {
			featuredProjects,
			allProjectPosts: showAll ? allProjectPosts : [],
			showAll,
			settings: {
				pageTitle: pageTitle || 'My Projects',
				pageSubtitle:
					pageSubtitle || "Explore the things I've built and the problems I've solved."
			}
		};
	} catch (err: any) {
		console.error('Failed to load projects page:', err);
		throw error(500, 'Failed to load projects page');
	}
};
