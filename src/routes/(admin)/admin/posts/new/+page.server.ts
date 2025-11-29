import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return {
			categories: [],
			tags: []
		};
	}

	const db = platform.env.DB;

	try {
		// Fetch all categories
		const categoriesResult = await db
			.prepare('SELECT id, name, slug FROM categories ORDER BY name ASC')
			.all<{ id: string; name: string; slug: string }>();

		// Fetch all tags
		const tagsResult = await db
			.prepare('SELECT id, name, slug FROM tags ORDER BY name ASC')
			.all<{ id: string; name: string; slug: string }>();

		return {
			categories: categoriesResult.results || [],
			tags: tagsResult.results || []
		};
	} catch (error) {
		console.error('Failed to load categories and tags:', error);
		return {
			categories: [],
			tags: []
		};
	}
};
