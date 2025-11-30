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
                const parsedBody = (await request.json()) as unknown;
                if (!parsedBody || typeof parsedBody !== 'object') {
                        throw error(400, 'Invalid request body');
                }

                const { name, slug } = parsedBody as Record<string, unknown>;

                if (typeof name !== 'string') {
                        throw error(400, 'Category name is required');
                }

                if (name.trim().length === 0) {
                        throw error(400, 'Category name cannot be empty');
                }

                if (name.length > 100) {
                        throw error(400, 'Category name is too long (max 100 characters)');
                }

                if (slug !== undefined && typeof slug !== 'string') {
                        throw error(400, 'Category slug must be a string');
                }

                const category = await createCategory(platform.env.DB, {
                        name: name.trim(),
                        slug: slug?.trim() ?? undefined
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
