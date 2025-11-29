import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { publishPost } from '$lib/server/db/admin-posts';
import { invalidateCache, getCacheKey } from '$lib/server/cache/cache';

/**
 * PATCH /api/admin/posts/[id]/publish
 * Publish a post
 */
export const PATCH: RequestHandler = async ({ platform, locals, params }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const post = await publishPost(db, params.id);
		if (platform.env.CACHE) {
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 10, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 20, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('post', post.slug));
		}
		return json(post);
	} catch (err) {
		console.error('Failed to publish post:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('not found')) {
			throw error(404, 'Post not found');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to publish post');
	}
};
