import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllPages, createPage, pageSlugExists } from '$lib/server/db/pages';
import { syncPostMedia } from '$lib/server/db/media';
import { invalidateCache, getCacheKey } from '$lib/server/cache/cache';

/**
 * GET /api/admin/pages
 * List all pages (admin only)
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
	const limit = parseInt(url.searchParams.get('limit') ?? '50');
	const offset = parseInt(url.searchParams.get('offset') ?? '0');

	try {
		const pages = await getAllPages(db, limit, offset);
		return json({ pages });
	} catch (err) {
		console.error('Failed to list pages:', err);
		throw error(500, 'Failed to list pages');
	}
};

/**
 * POST /api/admin/pages
 * Create a new page
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

		// Check if slug already exists
		if (body.slug) {
			const exists = await pageSlugExists(db, body.slug);
			if (exists) {
				throw error(409, 'A page with this slug already exists');
			}
		}

		// Create page with current user as author
		const pageId = await createPage(db, {
			author_id: locals.user.id,
			title: body.title,
			slug: body.slug,
			content_md: body.content_md,
			content_html: body.content_html,
			excerpt: body.excerpt,
			hero_image_id: body.hero_image_id,
			status: body.status ?? 'draft',
			template: body.template ?? 'page.njk'
		});

		// Sync media relationships (same as posts)
		await syncPostMedia(db, pageId, body.content_html, body.hero_image_id ?? null);

		// Invalidate cache if publishing
		if (body.status === 'published' && platform.env.CACHE) {
			await invalidateCache(platform.env.CACHE, getCacheKey('page', body.slug));
		}

		return json({ id: pageId }, { status: 201 });
	} catch (err) {
		console.error('Failed to create page:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			throw error(409, 'A page with this slug already exists');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to create page');
	}
};
