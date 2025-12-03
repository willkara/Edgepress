import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostsByCategory } from '$lib/server/db/posts';
import { getCategoryBySlug } from '$lib/server/db/categories';
import { postSchema } from '$lib/types/posts';
import { categorySchema } from '$lib/types/taxonomy';

export const load: PageServerLoad = async ({ params, platform }) => {
	const { slug } = params;

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		// Get the category to verify it exists
		const categoryRaw = await getCategoryBySlug(platform.env.DB as D1Database, slug);

		if (!categoryRaw) {
			throw error(404, `Category "${slug}" not found`);
		}

		const category = categorySchema.parse(categoryRaw);

		// Get all posts in this category
		const postsRaw = await getPostsByCategory(platform.env.DB as D1Database, slug, 100, 0);
		const posts = postSchema.array().parse(postsRaw);

		return {
			category,
			posts,
			imageHash: platform.env.CF_IMAGES_HASH || ''
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Failed to load category page:', err);
		throw error(500, 'Failed to load category page');
	}
};
