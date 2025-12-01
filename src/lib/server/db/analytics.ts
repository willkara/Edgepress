import type { D1Database } from '@cloudflare/workers-types';

/**
 * Increments the view count for a post.
 * Updates both the total `view_count` on the post and the `daily_views` table.
 */
export async function incrementViewCount(db: D1Database, slug: string): Promise<number> {
	const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

	// We need the post ID first
	const post = await db
		.prepare('SELECT id, view_count FROM posts WHERE slug = ?')
		.bind(slug)
		.first<{ id: string; view_count: number }>();

	if (!post) {
		return 0;
	}

	// 1. Increment total view count
	await db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').bind(post.id).run();

	// 2. Upsert daily view count
	// SQLite ON CONFLICT clause handles the "create or increment" logic
	await db
		.prepare(
			`
			INSERT INTO daily_views (post_id, view_date, count)
			VALUES (?, ?, 1)
			ON CONFLICT(post_id, view_date) DO UPDATE SET count = count + 1
			`
		)
		.bind(post.id, date)
		.run();

	return post.view_count + 1;
}

/**
 * Get the current view count for a post
 */
export async function getViewCount(db: D1Database, slug: string): Promise<number> {
	const result = await db
		.prepare('SELECT view_count FROM posts WHERE slug = ?')
		.bind(slug)
		.first<{ view_count: number }>();

	return result?.view_count || 0;
}
