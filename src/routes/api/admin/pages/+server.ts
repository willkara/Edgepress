import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllPages, createPage, pageSlugExists } from '$lib/server/db/pages';
import { syncPostMedia } from '$lib/server/db/media';
import { invalidateCache, getCacheKey } from '$lib/server/cache/cache';
import { createPageSchema, listPagesQuerySchema } from '$lib/schemas/pages';
import { ZodError } from 'zod';

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

	try {
		// Validate query parameters
		const queryParams = listPagesQuerySchema.parse({
			limit: url.searchParams.get('limit'),
			offset: url.searchParams.get('offset')
		});

		const pages = await getAllPages(db, queryParams.limit, queryParams.offset);
		return json({ pages });
	} catch (err) {
		if (err instanceof ZodError) {
			throw error(400, {
				message: 'Invalid query parameters',
				errors: err.format()
			});
		}
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

		// Validate request body with Zod schema
		const validatedData = createPageSchema.parse(body);

		// Check if slug already exists
		if (validatedData.slug) {
			const exists = await pageSlugExists(db, validatedData.slug);
			if (exists) {
				throw error(409, 'A page with this slug already exists');
			}
		}

		// Create page with current user as author
		const pageId = await createPage(db, {
			author_id: locals.user.id,
			title: validatedData.title,
			slug: validatedData.slug,
			content_md: validatedData.content_md,
			content_html: validatedData.content_html,
			excerpt: validatedData.excerpt ?? null,
			hero_image_id: validatedData.hero_image_id ?? null,
			status: validatedData.status,
			template: validatedData.template
		});

		// Sync media relationships (same as posts)
		await syncPostMedia(db, pageId, validatedData.content_html, validatedData.hero_image_id ?? null);

		// Invalidate cache if publishing
		if (validatedData.status === 'published' && platform.env.CACHE) {
			await invalidateCache(platform.env.CACHE, getCacheKey('page', validatedData.slug));
		}

		return json({ id: pageId }, { status: 201 });
	} catch (err) {
		if (err instanceof ZodError) {
			throw error(400, {
				message: 'Invalid page data',
				errors: err.format()
			});
		}

		console.error('Failed to create page:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			throw error(409, 'A page with this slug already exists');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to create page');
	}
};
