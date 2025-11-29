import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPostById, updatePost, deletePost } from '$lib/server/db/admin-posts';
import { syncPostMedia } from '$lib/server/db/media';

/**
 * GET /api/admin/posts/[id]
 * Get a single post by ID
 */
export const GET: RequestHandler = async ({ platform, locals, params }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const post = await getPostById(db, params.id);

		if (!post) {
			throw error(404, 'Post not found');
		}

		return json(post);
	} catch (err) {
		if (err instanceof Error && 'status' in err && (err as any).status === 404) {
			throw err;
		}
		console.error('Failed to get post:', err);
		throw error(500, 'Failed to get post');
	}
};

/**
 * PUT /api/admin/posts/[id]
 * Update a post
 */
export const PUT: RequestHandler = async ({ platform, locals, params, request }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const body = await request.json();

		const post = await updatePost(db, params.id, {
			title: body.title,
			slug: body.slug,
			content_md: body.content_md,
			content_html: body.content_html,
			excerpt: body.excerpt,
			hero_image_id: body.hero_image_id,
			category_id: body.category_id,
			status: body.status,
			published_at: body.published_at
		});

		// Sync media relationships
		await syncPostMedia(db, params.id, body.content_html, body.hero_image_id ?? null);

		// Invalidate post caches
		if (platform.env.CACHE) {
			const { invalidateCache, getCacheKey } = await import('$lib/server/cache/cache');
			// Invalidate landing page and default list
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 10, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 20, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('post', post.slug));
		}

		return json(post);
	} catch (err) {
		console.error('Failed to update post:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			throw error(409, 'A post with this slug already exists');
		}

		if (message.includes('not found')) {
			throw error(404, 'Post not found');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to update post');
	}
};

/**
 * DELETE /api/admin/posts/[id]
 * Delete a post
 */
export const DELETE: RequestHandler = async ({ platform, locals, params }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		// Check if post exists
		const post = await getPostById(db, params.id);
		if (!post) {
			throw error(404, 'Post not found');
		}

		await deletePost(db, params.id);

		// Invalidate post caches
		if (platform.env.CACHE) {
			const { invalidateCache, getCacheKey } = await import('$lib/server/cache/cache');
			// Invalidate landing page and default list
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 10, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 20, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('post', post.slug));
		}

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err && (err as any).status === 404) {
			throw err;
		}
		console.error('Failed to delete post:', err);
		throw error(500, 'Failed to delete post');
	}
};
