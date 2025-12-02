import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPageById, updatePage, deletePage, pageSlugExists, invalidatePageCache } from '$lib/server/db/pages';
import { syncPostMedia } from '$lib/server/db/media';

/**
 * GET /api/admin/pages/[id]
 * Get a single page by ID
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
		const page = await getPageById(db, params.id);

		if (!page) {
			throw error(404, 'Page not found');
		}

		return json(page);
	} catch (err) {
		if (err instanceof Error && 'status' in err && (err as any).status === 404) {
			throw err;
		}
		console.error('Failed to get page:', err);
		throw error(500, 'Failed to get page');
	}
};

/**
 * PUT /api/admin/pages/[id]
 * Update a page
 */
export const PUT: RequestHandler = async ({ platform, locals, params, request }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const cache = platform.env.CACHE;

	try {
		const body = await request.json();

		// Get the current page to check slug changes
		const currentPage = await getPageById(db, params.id);
		if (!currentPage) {
			throw error(404, 'Page not found');
		}

		// If slug is changing, check if new slug already exists
		if (body.slug && body.slug !== currentPage.slug) {
			const exists = await pageSlugExists(db, body.slug, params.id);
			if (exists) {
				throw error(409, 'A page with this slug already exists');
			}
		}

		// Update the page
		await updatePage(db, params.id, {
			title: body.title,
			slug: body.slug,
			content_md: body.content_md,
			content_html: body.content_html,
			excerpt: body.excerpt,
			hero_image_id: body.hero_image_id,
			status: body.status,
			template: body.template
		});

		// Sync media relationships
		if (body.content_html) {
			await syncPostMedia(db, params.id, body.content_html, body.hero_image_id ?? null);
		}

		// Invalidate cache for both old and new slugs
		if (currentPage.slug) {
			await invalidatePageCache(cache, currentPage.slug);
		}
		if (body.slug && body.slug !== currentPage.slug) {
			await invalidatePageCache(cache, body.slug);
		}

		// Get updated page to return
		const updatedPage = await getPageById(db, params.id);

		return json(updatedPage);
	} catch (err) {
		console.error('Failed to update page:', err);

		const message = err instanceof Error ? err.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			throw error(409, 'A page with this slug already exists');
		}

		if (message.includes('not found')) {
			throw error(404, 'Page not found');
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to update page');
	}
};

/**
 * DELETE /api/admin/pages/[id]
 * Delete a page
 */
export const DELETE: RequestHandler = async ({ platform, locals, params }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const cache = platform.env.CACHE;

	try {
		// Check if page exists
		const page = await getPageById(db, params.id);
		if (!page) {
			throw error(404, 'Page not found');
		}

		// Delete the page
		await deletePage(db, params.id);

		// Invalidate cache
		if (page.slug) {
			await invalidatePageCache(cache, page.slug);
		}

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err && (err as any).status === 404) {
			throw err;
		}
		console.error('Failed to delete page:', err);
		throw error(500, 'Failed to delete page');
	}
};
