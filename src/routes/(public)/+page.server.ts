import { getPublishedPostsCached, getPopularPosts } from '$lib/server/db/posts';
import { getAllProjects } from '$lib/server/db/projects';
import { getAllCategories } from '$lib/server/db/categories';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			latestPosts: [],
			featuredProjects: [],
			categories: [],
			popularPosts: [],
			imageHash: ''
		};
	}

	try {
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		const [latestPosts, allProjects, categories, popularPosts] = await Promise.all([
			getPublishedPostsCached(platform.env.DB, platform.env.CACHE, 5, 0),
			getAllProjects(platform.env.DB, true), // true = only featured
			getAllCategories(platform.env.DB, true),
			getPopularPosts(platform.env.DB, 5)
		]);

		return {
			latestPosts,
			featuredProjects: allProjects.slice(0, 3), // Only show 3 featured
			categories,
			popularPosts,
			imageHash: platform.env.CF_IMAGES_HASH
		};
	} catch (error) {
		console.error('Failed to load homepage:', error);
		return {
			latestPosts: [],
			featuredProjects: [],
			categories: [],
			popularPosts: [],
			imageHash: ''
		};
	}
};
