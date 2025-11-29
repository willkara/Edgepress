import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPosts, createPost } from '$lib/server/db/admin-posts';
import { syncPostMedia } from '$lib/server/db/media';
import { invalidateCache, getCacheKey } from '$lib/server/cache/cache';

/**
 * GET /api/admin/posts
 * List posts with optional filters
 */
export const GET: RequestHandler = async ({ platform, locals, url }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	// Parse query parameters
	const status = url.searchParams.get('status') ?? 'all';
	const search = url.searchParams.get('search') ?? undefined;
	const category_id = url.searchParams.get('category_id') ?? undefined;
	const author_id = url.searchParams.get('author_id') ?? undefined;
	const limit = parseInt(url.searchParams.get('limit') ?? '20');
	const offset = parseInt(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listPosts(db, {
			status: status as 'draft' | 'published' | 'all',
			search,
			category_id,
			author_id,
			limit,
			offset
		});

		return json(result);
	} catch (err) {
		console.error('Failed to list posts:', err);
		throw error(500, 'Failed to list posts');
	}
};

/**
 * POST /api/admin/posts
 * Create a new post
 */
export const POST: RequestHandler = async ({ platform, locals, request }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const body = await request.json();

		// Validate required fields
		if (!body.title || !body.content_md || !body.content_html) {
			throw error(400, 'Missing required fields: title, content_md, content_html');
		}

		// Create post with current user as author
		const post = await createPost(db, {
			author_id: locals.user.id,
			title: body.title,
			slug: body.slug,
			content_md: body.content_md,
			content_html: body.content_html,
			excerpt: body.excerpt,
			hero_image_id: body.hero_image_id,
			category_id: body.category_id,
			status: body.status ?? 'draft',
			published_at: body.published_at
		});

		// Sync media relationships
		await syncPostMedia(db, post.id, body.content_html, body.hero_image_id ?? null);

		// Invalidate public caches (best-effort)
		if (platform.env.CACHE) {
			// Landing page uses limit 10
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 10, 0));
			// Default list uses limit 20
			await invalidateCache(platform.env.CACHE, getCacheKey('posts:published', 20, 0));
			await invalidateCache(platform.env.CACHE, getCacheKey('post', post.slug));
		}

		return json(post, { status: 201 });
	} catch (err) {
		console.error('Failed to create post:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			throw error(409, 'A post with this slug already exists');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to create post');
	}
};
