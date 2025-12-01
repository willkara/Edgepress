import { getPublishedPostsCached, getPopularPosts } from '$lib/server/db/posts';
import { getFeaturedProjects } from '$lib/server/db/featured-projects';
import { getAllCategories } from '$lib/server/db/categories';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import type { PageServerLoad } from './$types';
import { categorySchema, featuredProjectSchema, projectPostSchema } from '$lib/types/projects';

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			latestPosts: [],
			featuredProjects: [],
			categories: [],
			popularPosts: []
		};
	}

	try {
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		const [latestPostsRaw, featuredProjectsRaw, categoriesRaw, popularPostsRaw] = await Promise.all(
			[
				getPublishedPostsCached(platform.env.DB, platform.env.CACHE, 5, 0),
				getFeaturedProjects(platform.env.DB, false),
				getAllCategories(platform.env.DB, true),
				getPopularPosts(platform.env.DB, 5)
			]
		);

		const latestPosts = projectPostSchema.array().parse(latestPostsRaw);
		const featuredProjects = featuredProjectSchema.array().parse(featuredProjectsRaw);
		const categories = categorySchema.array().parse(categoriesRaw);
		const popularPosts = projectPostSchema.array().parse(popularPostsRaw);

		return {
			latestPosts,
			featuredProjects: featuredProjects.slice(0, 3), // Only show 3 featured
			categories,
			popularPosts
		};
	} catch (error) {
		console.error('Failed to load homepage:', error);
		return {
			latestPosts: [],
			featuredProjects: [],
			categories: [],
			popularPosts: []
		};
	}
};
