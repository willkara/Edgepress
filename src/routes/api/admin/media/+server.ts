import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMedia } from '$lib/server/db/media';

/**
 * GET /api/admin/media
 * List media with optional filters
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
	const filter = (url.searchParams.get('filter') ?? 'all') as 'all' | 'used' | 'orphaned';
	const limit = parseInt(url.searchParams.get('limit') ?? '50');
	const offset = parseInt(url.searchParams.get('offset') ?? '0');

	try {
		const media = await listMedia(db, {
			filter,
			limit,
			offset
		});

		return json({ media });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to list media';
		console.error('Failed to list media:', err);
		throw error(500, message);
	}
};
