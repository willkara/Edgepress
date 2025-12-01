import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { publishPost } from '$lib/server/db/admin-posts';
import { invalidateCache } from '$lib/server/cache/cache';

/**
 * PATCH /api/admin/posts/[id]/publish
 * Publish a post
 */
export const PATCH: RequestHandler = async ({ platform, locals, params, request }): Promise<Response> => {
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
			await invalidateCache(platform.env.CACHE, 'posts');
		}

		try {
			const { deleteEdgeCached } = await import('$lib/server/cache/edge-cache');
			const publicUrl = new URL(`/post/${post.slug}`, new URL(request.url).origin);
			const cache = platform?.caches ? (platform.caches as unknown as { default: Cache }).default : undefined;
			if (cache) {
				await deleteEdgeCached(publicUrl, cache);
			}
		} catch (edgeErr) {
			console.error('Failed to invalidate edge cache:', edgeErr);
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
