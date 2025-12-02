import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { listPosts, createPost } from '$lib/server/db/admin-posts';
import { syncPostMedia } from '$lib/server/db/media';
import { invalidateCache, getCacheKey } from '$lib/server/cache/cache';
import { upsertPostVector } from '$lib/server/vectorize/post-index';

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
		const result = await listPosts(db as D1Database, {
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

	const createPostSchema = z.object({
		title: z.string(),
		slug: z.string(),
		content_md: z.string(),
		content_html: z.string(),
		excerpt: z.string().optional(),
		hero_image_id: z.string().optional(),
		category_id: z.string().optional(),
		status: z.enum(['draft', 'published']).optional(),
		published_at: z.string().optional()
	});

	try {
		const json = await request.json();
		const body = createPostSchema.parse(json);

		// Create post with current user as author
		const post = await createPost(db as D1Database, {
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
		await syncPostMedia(db as D1Database, post.id, body.content_html, body.hero_image_id ?? null);

		// Invalidate public caches (best-effort)
		if (platform.env.CACHE) {
			// Landing page uses limit 10
			await invalidateCache(
				platform.env.CACHE as KVNamespace,
				getCacheKey('posts:published', 10, 0)
			);
			// Default list uses limit 20
			await invalidateCache(
				platform.env.CACHE as KVNamespace,
				getCacheKey('posts:published', 20, 0)
			);
			await invalidateCache(platform.env.CACHE as KVNamespace, getCacheKey('post', post.slug));
		}

		// Best-effort vector index update for semantic search.
		if (platform.env.AI && platform.env.VECTORIZE) {
			try {
				await upsertPostVector(platform.env.AI, platform.env.VECTORIZE, {
					id: post.id,
					title: post.title,
					slug: post.slug,
					contentMd: body.content_md,
					excerpt: body.excerpt,
					status: post.status,
					publishedAt: post.published_at,
					categoryId: post.category_id
				});
			} catch (vectorError) {
				console.error('Failed to index post in Vectorize:', vectorError);
			}
		}

		return json(post, { status: 201 });
	} catch (err) {
		console.error('Failed to create post:', err);

		if (err instanceof z.ZodError) {
			throw error(400, `Validation error: ${err.errors.map((e) => e.message).join(', ')}`);
		}

		const message = err instanceof Error ? err.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			throw error(409, 'A post with this slug already exists');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to create post');
	}
};
