import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { incrementViewCount } from '$lib/server/db/analytics';
import { requireEnv } from '$lib/server/env';

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const env = requireEnv(event, ['DB']);

	try {
		const body = (await request.json()) as Record<string, unknown>;
		const slug =
			typeof body.slug === 'string' && body.slug.trim().length > 0 ? body.slug.trim() : undefined;

		if (!slug) {
			return json({ error: 'Slug is required' }, { status: 400 });
		}

		const newCount = await incrementViewCount(env.DB, slug);

		return json({ views: newCount });
	} catch (error) {
		console.error('Failed to increment view count:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
