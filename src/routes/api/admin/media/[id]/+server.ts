import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMediaById, getMediaUsage, updateMedia, deleteMedia } from '$lib/server/db/media';

/**
 * GET /api/admin/media/[id]
 * Get a single media item with usage details
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
		const media = await getMediaById(db as D1Database, params.id);

		if (!media) {
			throw error(404, 'Media not found');
		}

		const usage = await getMediaUsage(db as D1Database, params.id);

		return json({
			...media,
			posts: usage
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw err;
		}
		const message = err instanceof Error ? err.message : 'Failed to get media';
		console.error('Failed to get media:', err);
		throw error(500, message);
	}
};

/**
 * PUT /api/admin/media/[id]
 * Update media metadata (alt_text, filename)
 */
export const PUT: RequestHandler = async ({
	platform,
	locals,
	params,
	request
}): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	try {
		const body = (await request.json()) as { alt_text?: string; filename?: string };

		const media = await updateMedia(db as D1Database, params.id, {
			alt_text: body.alt_text,
			filename: body.filename
		});

		if (!media) {
			throw error(404, 'Media not found');
		}

		return json(media);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw err;
		}
		const message = err instanceof Error ? err.message : 'Failed to update media';
		console.error('Failed to update media:', err);
		throw error(500, message);
	}
};

/**
 * DELETE /api/admin/media/[id]
 * Delete media (only if orphaned - usage_count = 0)
 */
export const DELETE: RequestHandler = async ({ platform, locals, params }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB || !platform?.env?.CF_ACCOUNT_ID || !platform?.env?.CF_IMAGES_TOKEN) {
		throw error(500, 'Required environment variables not available');
	}

	const db = platform.env.DB;
	const cfAccountId = platform.env.CF_ACCOUNT_ID;
	const cfToken = platform.env.CF_IMAGES_TOKEN;

	try {
		const result = await deleteMedia(db as D1Database, params.id, cfAccountId, cfToken);

		if (!result.success) {
			throw error(400, result.message);
		}

		return json({ success: true, message: result.message });
	} catch (err: unknown) {
		if (
			err &&
			typeof err === 'object' &&
			'status' in err &&
			(err as { status: number }).status === 400
		) {
			throw err;
		}
		const message = err instanceof Error ? err.message : 'Failed to delete media';
		console.error('Failed to delete media:', err);
		throw error(500, message);
	}
};
