import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTags, createTag } from '$lib/server/db/tags';
import { requireEnv } from '$lib/server/env';

/**
 * GET /api/admin/tags
 * List all tags with post counts
 */
export const GET: RequestHandler = async (event): Promise<Response> => {
	const { locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB', 'CACHE']);

	try {
		const tags = await getAllTags(env.DB, true);
		return json(tags);
	} catch (err) {
		console.error('Failed to list tags:', err);
		const message = err instanceof Error ? err.message : 'Failed to list tags';
		throw error(500, message);
	}
};

/**
 * POST /api/admin/tags
 * Create a new tag
 */
type TagPayload = {
	name?: unknown;
	slug?: unknown;
};

export const POST: RequestHandler = async (event): Promise<Response> => {
	const { request, locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB', 'CACHE']);

	try {
		const body = (await request.json()) as TagPayload;

		// Validate required fields
		if (typeof body.name !== 'string' || body.name.trim().length === 0) {
			throw error(400, 'Tag name is required');
		}

		if (body.name.length > 100) {
			throw error(400, 'Tag name is too long (max 100 characters)');
		}

		// Validate slug if provided
		if (body.slug !== undefined && typeof body.slug !== 'string') {
			throw error(400, 'Tag slug must be a string');
		}

		const tag = await createTag(env.DB, {
			name: body.name.trim(),
			slug: body.slug?.trim() ?? undefined
		});

		// Invalidate tags cache
		if (env.CACHE) {
			const { invalidateCache } = await import('$lib/server/cache/cache');
			await invalidateCache(env.CACHE, 'tags:all:*');
		}

		return json(tag, { status: 201 });
	} catch (err) {
		console.error('Failed to create tag:', err);

		// Check for duplicate slug error
		if (err instanceof Error && err.message.includes('already exists')) {
			throw error(409, err.message);
		}

		const message = err instanceof Error ? err.message : 'Failed to create tag';
		throw error(500, message);
	}
};
