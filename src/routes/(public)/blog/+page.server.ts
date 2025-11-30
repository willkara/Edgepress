import { getPublishedPostsCached } from '$lib/server/db/posts';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { postSchema } from '$lib/types/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			posts: []
		};
	}

	try {
                const postsRaw = await getPublishedPostsCached(
                        platform.env.DB,
                        platform.env.CACHE,
                        20,
                        0
                );
                const posts = postSchema.array().parse(postsRaw);

		// Set cache headers for public blog list
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		return {
			posts
		};
	} catch (err) {
		console.error('Failed to load blog posts:', err);
		return {
			posts: []
		};
	}
};
