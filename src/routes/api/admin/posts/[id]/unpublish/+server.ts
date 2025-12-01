import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { unpublishPost } from '$lib/server/db/admin-posts';
import { invalidateCache } from '$lib/server/cache/cache';
import { requireEnv } from '$lib/server/env';

/**
 * PATCH /api/admin/posts/[id]/unpublish
 * Unpublish a post (set to draft)
 */
export const PATCH: RequestHandler = async (event): Promise<Response> => {
	const { locals, params, request, platform } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB', 'CACHE']);
	const db = env.DB;

	try {
		const post = await unpublishPost(db, params.id);
		if (env.CACHE) {
			await invalidateCache(env.CACHE, 'posts');
		}

		if (platform?.caches) {
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
		}

		return json(post);
	} catch (err) {
		console.error('Failed to unpublish post:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('not found')) {
			throw error(404, 'Post not found');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to unpublish post');
	}
};
