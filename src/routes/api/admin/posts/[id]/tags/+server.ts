import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPostTags, updatePostTags } from '$lib/server/db/admin-posts';
import { requireEnv } from '$lib/server/env';

/**
 * GET /api/admin/posts/[id]/tags
 * Get all tags for a post
 */
export const GET: RequestHandler = async (event): Promise<Response> => {
	const { locals, params } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB']);
	const db = env.DB;

	try {
		const tags = await getPostTags(db, params.id);
		return json(tags);
	} catch (err) {
		console.error('Failed to get post tags:', err);
		throw error(500, 'Failed to get post tags');
	}
};

/**
 * PUT /api/admin/posts/[id]/tags
 * Update post tags (replaces all existing tags)
 */
export const PUT: RequestHandler = async (event): Promise<Response> => {
	const { locals, params, request } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB']);
	const db = env.DB;

	try {
		const body = (await request.json()) as { tag_ids?: unknown };

		if (!Array.isArray(body.tag_ids) || body.tag_ids.some((t): boolean => typeof t !== 'string')) {
			throw error(400, 'tag_ids must be an array of strings');
		}

		await updatePostTags(db, params.id, body.tag_ids as string[]);

		// Return updated tags
		const tags = await getPostTags(db, params.id);
		return json(tags);
	} catch (err) {
		if (
			err &&
			typeof err === 'object' &&
			'status' in err &&
			(err as { status?: number }).status === 400
		) {
			throw err;
		}
		console.error('Failed to update post tags:', err);
		throw error(500, 'Failed to update post tags');
	}
};
