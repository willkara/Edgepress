import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostById, getPostTags } from '$lib/server/db/admin-posts';

export const load: PageServerLoad = async ({ platform, params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const post = await getPostById(db as D1Database, params.id);
		if (!post) {
			throw error(404, 'Post not found');
		}

		const postTags = await getPostTags(db as D1Database, params.id);

		const categoriesResult = await (db as any)
			.prepare('SELECT id, name, slug FROM categories ORDER BY name ASC')
			.all<{ id: string; name: string; slug: string }>();

		const tagsResult = await (db as any)
			.prepare('SELECT id, name, slug FROM tags ORDER BY name ASC')
			.all<{ id: string; name: string; slug: string }>();

		return {
			post,
			postTags: postTags.map((t) => t.id),
			categories: (categoriesResult.results as any[]) || [],
			tags: (tagsResult.results as any[]) || []
		};
	} catch (err) {
		console.error('Failed to load post for editing:', err);
		throw error(500, 'Failed to load post');
	}
};
