import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listMedia } from '$lib/server/db/media';

export const load: PageServerLoad = async ({ platform, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!platform?.env?.DB || !platform?.env?.CF_IMAGES_HASH) {
		throw new Error('Required environment variables not configured');
	}

	const filter = (url.searchParams.get('filter') ?? 'all') as 'all' | 'used' | 'orphaned';

	const db = platform?.env?.DB;
	if (!db) {
		throw new Error('Database not available');
	}

	const cfImagesHash = platform?.env?.CF_IMAGES_HASH;
	if (!cfImagesHash) {
		throw new Error('Cloudflare Images hash not configured');
	}

	const media = await listMedia(db, {
		filter,
		limit: 100,
		offset: 0
	});

	return {
		media,
		filter,
		cfImagesHash
	};
};
