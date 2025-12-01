import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getCategoryById,
	updateCategory,
	deleteCategory,
	getCategoryPostCount
} from '$lib/server/db/categories';

/**
 * GET /api/admin/categories/[id]
 * Get a single category by ID
 */
export const GET: RequestHandler = async ({ params, platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const category = await getCategoryById(platform.env.DB, params.id);

		if (!category) {
			throw error(404, 'Category not found');
		}

		return json(category);
	} catch (err) {
		console.error('Failed to get category:', err);

		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to get category';
		throw error(500, message);
	}
};

/**
 * PUT /api/admin/categories/[id]
 * Update a category
 */
export const PUT: RequestHandler = async ({
	params,
	request,
	platform,
	locals
}): Promise<Response> => {
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

		if (name !== undefined) {
			if (typeof name !== 'string') {
				throw error(400, 'Category name must be a string');
			}

			if (name.trim().length === 0) {
				throw error(400, 'Category name cannot be empty');
			}

			if (name.length > 100) {
				throw error(400, 'Category name is too long (max 100 characters)');
			}
		}

		if (slug !== undefined && typeof slug !== 'string') {
			throw error(400, 'Category slug must be a string');
		}

		const category = await updateCategory(platform.env.DB, params.id, {
			name: typeof name === 'string' ? name.trim() : undefined,
			slug: typeof slug === 'string' ? slug.trim() : undefined
		});

		// Invalidate categories cache
		if (platform.env.CACHE) {
			const { invalidateCache } = await import('$lib/server/cache/cache');
			await invalidateCache(platform.env.CACHE, 'categories:all:*');
		}

		return json(category);
	} catch (err) {
		console.error('Failed to update category:', err);

		// Check for duplicate slug error
		if (err instanceof Error && err.message.includes('already exists')) {
			throw error(409, err.message);
		}

		// Check for not found error
		if (err instanceof Error && err.message.includes('not found')) {
			throw error(404, err.message);
		}

		const message = err instanceof Error ? err.message : 'Failed to update category';
		throw error(500, message);
	}
};

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
 */
export const DELETE: RequestHandler = async ({ params, platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		// Get post count for response
		const postCount = await getCategoryPostCount(platform.env.DB, params.id);

		// Delete the category (posts will be set to category_id = NULL)
		await deleteCategory(platform.env.DB, params.id);

		// Invalidate categories cache
		if (platform.env.CACHE) {
			const { invalidateCache } = await import('$lib/server/cache/cache');
			await invalidateCache(platform.env.CACHE, 'categories:all:*');
		}

		return json({
			success: true,
			affected_posts: postCount,
			message:
				postCount > 0
					? `Category deleted. ${postCount} post(s) are now uncategorized.`
					: 'Category deleted.'
		});
	} catch (err) {
		console.error('Failed to delete category:', err);

		// Check for not found error
		if (err instanceof Error && err.message.includes('not found')) {
			throw error(404, err.message);
		}

		const message = err instanceof Error ? err.message : 'Failed to delete category';
		throw error(500, message);
	}
};
