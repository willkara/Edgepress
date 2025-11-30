import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { getFeaturedProjects, getFeaturedProjectsCached } from '$lib/server/db/featured-projects';
import { withRequestLogging } from '$lib/server/db/logger';
import { getSetting } from '$lib/server/db/settings';
import { getPublishedPosts, getPublishedPostsCached } from '$lib/server/db/posts';

const DEFAULT_PROJECTS_PAGE_SUBTITLE = "Explore the things I've built and the problems I've solved.";

export const load: PageServerLoad = async ({ platform, setHeaders, locals }) => {
        if (!platform?.env?.DB) {
                throw error(500, 'Database not available');
        }

        setCacheHeaders(setHeaders, CachePresets.publicPage());

        const requestId = locals.requestId as string | undefined;

        const cache = platform.env.CACHE;
        const db = platform.env.DB;

        const logDbCall = async <T>(operation: string, fn: () => Promise<T>) =>
                withRequestLogging(requestId, `projects:${operation}`, fn);

        try {
                const [featuredProjects, pageTitle, pageSubtitle, showAllSetting] = await Promise.all([
                        logDbCall('featured-projects', async () =>
                                cache
                                        ? getFeaturedProjectsCached(db, cache, false)
                                        : getFeaturedProjects(db, false)
                        ),
                        logDbCall('setting:projects_page_title', () =>
                                getSetting(db, 'projects_page_title')
                        ),
                        logDbCall('setting:projects_page_subtitle', () =>
                                getSetting(db, 'projects_page_subtitle')
                        ),
                        logDbCall('setting:projects_page_show_all', () =>
                                getSetting(db, 'projects_page_show_all')
                        )
                ]);

                const showAll = showAllSetting === '1';

                // If showAll is enabled, also fetch all posts with "Projects" category
                let allProjectPosts: any[] = [];
                if (showAll) {
                        const allPosts = await logDbCall('projects-category-posts', () =>
                                cache
                                        ? getPublishedPostsCached(db, cache, 100, 0)
                                        : getPublishedPosts(db, 100, 0)
                        );
                        allProjectPosts = allPosts.filter((post) => post.category_slug === 'projects');
                }

		return {
			featuredProjects,
			allProjectPosts: showAll ? allProjectPosts : [],
                        showAll,
                        settings: {
                                pageTitle: pageTitle || 'My Projects',
                                pageSubtitle: pageSubtitle || DEFAULT_PROJECTS_PAGE_SUBTITLE
                        }
                };
	} catch (err: any) {
		console.error('Failed to load projects page:', err);
		throw error(500, 'Failed to load projects page');
	}
};
