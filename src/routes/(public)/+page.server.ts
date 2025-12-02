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

		const [latestPosts, featuredProjects, categories, popularPosts] = await Promise.all([
			getPublishedPostsCached(
				platform.env.DB as D1Database,
				platform.env.CACHE as KVNamespace,
				5,
				0
			),
			getAllProjects(platform.env.DB as D1Database, true),
			getAllCategories(platform.env.DB as D1Database, true),
			getPopularPosts(platform.env.DB as D1Database, 5)
		]);

		return {
			latestPosts,
			featuredProjects: featuredProjects.slice(0, 3),
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
