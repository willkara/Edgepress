import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllCategories, createCategory } from '$lib/server/db/categories';

/**
 * GET /api/admin/categories
 * List all categories with post counts
 */
export const GET: RequestHandler = async ({ platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const categories = await getAllCategories(platform.env.DB, true);
		return json(categories);
	} catch (err) {
		console.error('Failed to list categories:', err);
		const message = err instanceof Error ? err.message : 'Failed to list categories';
		throw error(500, message);
	}
};

/**
 * POST /api/admin/categories
 * Create a new category
 */
export const POST: RequestHandler = async ({ request, platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || typeof body.name !== 'string') {
			throw error(400, 'Category name is required');
		}

		if (body.name.trim().length === 0) {
			throw error(400, 'Category name cannot be empty');
		}

		if (body.name.length > 100) {
			throw error(400, 'Category name is too long (max 100 characters)');
		}

		// Validate slug if provided
		if (body.slug !== undefined && typeof body.slug !== 'string') {
			throw error(400, 'Category slug must be a string');
		}

		const category = await createCategory(platform.env.DB, {
			name: body.name.trim(),
			slug: body.slug?.trim() ?? undefined
		});

		// Invalidate categories cache
		if (platform.env.CACHE) {
			const { invalidateCache } = await import('$lib/server/cache/cache');
			await invalidateCache(platform.env.CACHE, 'categories:all:*');
		}

		return json(category, { status: 201 });
	} catch (err) {
		console.error('Failed to create category:', err);

		// Check for duplicate slug error
		if (err instanceof Error && err.message.includes('already exists')) {
			throw error(409, err.message);
		}

		const message = err instanceof Error ? err.message : 'Failed to create category';
		throw error(500, message);
	}
};
