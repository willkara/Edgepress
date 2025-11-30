import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostsByCategory } from '$lib/server/db/posts';
import { getCategoryBySlug } from '$lib/server/db/categories';

export const load: PageServerLoad = async ({ params, platform }) => {
	const { slug } = params;

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		// Get the category to verify it exists
		const category = await getCategoryBySlug(platform.env.DB, slug);

		if (!category) {
			throw error(404, `Category "${slug}" not found`);
		}

		// Get all posts in this category
		const posts = await getPostsByCategory(platform.env.DB, slug, 100, 0);

		return {
			category,
			posts
		};
	} catch (err: any) {
		if (err.status === 404) {
			throw err;
		}
		console.error('Failed to load category page:', err);
		throw error(500, 'Failed to load category page');
	}
};
