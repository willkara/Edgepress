import type { PageServerLoad } from './$types';
import { requireEnv } from '$lib/server/env';

export const load: PageServerLoad = async (event) => {
	const env = requireEnv(event, ['DB']);
	const db = env.DB;

	// Get post counts
	const totalPostsQuery = await db
		.prepare('SELECT COUNT(*) as count FROM posts')
		.first<{ count: number }>();
	const publishedPostsQuery = await db
		.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'")
		.first<{ count: number }>();
	const draftPostsQuery = await db
		.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'")
		.first<{ count: number }>();

	// Get other counts
	const categoriesQuery = await db
		.prepare('SELECT COUNT(*) as count FROM categories')
		.first<{ count: number }>();
	const tagsQuery = await db
		.prepare('SELECT COUNT(*) as count FROM tags')
		.first<{ count: number }>();
	const mediaQuery = await db
		.prepare('SELECT COUNT(*) as count FROM media')
		.first<{ count: number }>();

	return {
		stats: {
			totalPosts: totalPostsQuery?.count ?? 0,
			publishedPosts: publishedPostsQuery?.count ?? 0,
			draftPosts: draftPostsQuery?.count ?? 0,
			totalCategories: categoriesQuery?.count ?? 0,
			totalTags: tagsQuery?.count ?? 0,
			totalMedia: mediaQuery?.count ?? 0
		}
	};
};
