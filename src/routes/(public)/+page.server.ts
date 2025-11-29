import { getPublishedPostsCached, getPublishedPostsCount } from '$lib/server/db/posts';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	// If we're not running in the Cloudflare runtime (e.g., local dev without env),
	// return a graceful empty state instead of throwing.
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			posts: [],
			totalCount: 0,
			warning: 'Edge runtime not available; showing empty list.'
		};
	}

	try {
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		const posts = await getPublishedPostsCached(platform.env.DB, platform.env.CACHE, 10, 0);
		const totalCount = await getPublishedPostsCount(platform.env.DB);

		return {
			posts,
			totalCount
		};
	} catch (error) {
		console.error('Failed to load published posts:', error);
		return {
			posts: [],
			totalCount: 0,
			warning: 'Unable to load posts right now.'
		};
	}
};
