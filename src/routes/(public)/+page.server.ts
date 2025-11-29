import { getPublishedPostsCached } from '$lib/server/db/posts';
import { getFeaturedProjects } from '$lib/server/db/featured-projects';
import { getAllCategories } from '$lib/server/db/categories';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			latestPosts: [],
			featuredProjects: [],
			categories: []
		};
	}

	try {
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		const [latestPosts, featuredProjects, categories] = await Promise.all([
			getPublishedPostsCached(platform.env.DB, platform.env.CACHE, 5, 0),
			getFeaturedProjects(platform.env.DB, false),
			getAllCategories(platform.env.DB, true)
		]);

		return {
			latestPosts,
			featuredProjects: featuredProjects.slice(0, 3), // Only show 3 featured
			categories
		};
	} catch (error) {
		console.error('Failed to load homepage:', error);
		return {
			latestPosts: [],
			featuredProjects: [],
			categories: []
		};
	}
};
