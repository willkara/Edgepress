import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTagById, updateTag, deleteTag, getTagPostCount } from '$lib/server/db/tags';
import { requireEnv } from '$lib/server/env';

/**
 * GET /api/admin/tags/[id]
 * Get a single tag by ID
 */
export const GET: RequestHandler = async (event): Promise<Response> => {
	const { params, locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB', 'CACHE']);

	try {
		const tag = await getTagById(env.DB, params.id);

		if (!tag) {
			throw error(404, 'Tag not found');
		}

		return json(tag);
	} catch (err) {
		console.error('Failed to get tag:', err);

		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to get tag';
		throw error(500, message);
	}
};

/**
 * PUT /api/admin/tags/[id]
 * Update a tag
 */
type TagUpdatePayload = {
	name?: unknown;
	slug?: unknown;
};

export const PUT: RequestHandler = async (event): Promise<Response> => {
	const { params, request, locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB', 'CACHE']);

	try {
		const body = (await request.json()) as TagUpdatePayload;

		// Validate name if provided
		if (body.name !== undefined) {
			if (typeof body.name !== 'string') {
				throw error(400, 'Tag name must be a string');
			}

			if (body.name.trim().length === 0) {
				throw error(400, 'Tag name cannot be empty');
			}

			if (body.name.length > 100) {
				throw error(400, 'Tag name is too long (max 100 characters)');
			}
		}

		// Validate slug if provided
		if (body.slug !== undefined && typeof body.slug !== 'string') {
			throw error(400, 'Tag slug must be a string');
		}

		const tag = await updateTag(env.DB, params.id, {
			name: body.name?.trim(),
			slug: body.slug?.trim()
		});

		// Invalidate tags cache
		if (env.CACHE) {
			const { invalidateCache } = await import('$lib/server/cache/cache');
			await invalidateCache(env.CACHE, 'tags:all:*');
		}

		return json(tag);
	} catch (err) {
		console.error('Failed to update tag:', err);

		// Check for duplicate slug error
		if (err instanceof Error && err.message.includes('already exists')) {
			throw error(409, err.message);
		}

		// Check for not found error
		if (err instanceof Error && err.message.includes('not found')) {
			throw error(404, err.message);
		}

		const message = err instanceof Error ? err.message : 'Failed to update tag';
		throw error(500, message);
	}
};

/**
 * DELETE /api/admin/tags/[id]
 * Delete a tag
 */
export const DELETE: RequestHandler = async (event): Promise<Response> => {
	const { params, locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB', 'CACHE']);

	try {
		// Get post count for response
		const postCount = await getTagPostCount(env.DB, params.id);

		// Delete the tag (post_tags entries will be automatically deleted via CASCADE)
		await deleteTag(env.DB, params.id);

		// Invalidate tags cache
		if (env.CACHE) {
			const { invalidateCache } = await import('$lib/server/cache/cache');
			await invalidateCache(env.CACHE, 'tags:all:*');
		}

		return json({
			success: true,
			affected_posts: postCount,
			message: postCount > 0 ? `Tag deleted. Removed from ${postCount} post(s).` : 'Tag deleted.'
		});
	} catch (err) {
		console.error('Failed to delete tag:', err);

		// Check for not found error
		if (err instanceof Error && err.message.includes('not found')) {
			throw error(404, err.message);
		}

		const message = err instanceof Error ? err.message : 'Failed to delete tag';
		throw error(500, message);
	}
};
