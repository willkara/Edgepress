import { getPostBySlugCached, getPostTags } from '$lib/server/db/posts';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			post: null,
			tags: [],
			envMissing: true
		};
	}

	try {
		const post = await getPostBySlugCached(platform.env.DB, platform.env.CACHE, params.slug);

		if (!post) {
			throw error(404, 'Post not found');
		}

		// Set cache headers for public blog post
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		const tags = await getPostTags(platform.env.DB, post.id);

		return {
			post,
			tags
		};
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Failed to load post:', err);
		throw error(500, 'Unable to load post');
	}
};
