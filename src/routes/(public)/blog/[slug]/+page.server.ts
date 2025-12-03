import { getPostBySlugCached, getPostTags, getRelatedPosts } from '$lib/server/db/posts';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { postSchema, postTagSchema } from '$lib/types/posts';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		return {
			post: null,
			tags: [],
			relatedPosts: [],
			imageHash: '',
			envMissing: true
		};
	}

	try {
		const postRaw = await getPostBySlugCached(
			platform.env.DB as D1Database,
			platform.env.CACHE as KVNamespace,
			params.slug
		);
		const post = postRaw ? postSchema.parse(postRaw) : null;

		if (!post) {
			throw error(404, 'Post not found');
		}

		// Set cache headers for public blog post
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		const [tagsRaw, relatedPostsRaw] = await Promise.all([
			getPostTags(platform.env.DB as D1Database, post.id),
			getRelatedPosts(platform.env.DB as D1Database, post.id, 3)
		]);

		const tags = postTagSchema.array().parse(tagsRaw);
		const relatedPosts = postSchema.array().parse(relatedPostsRaw);

		return {
			post,
			tags,
			relatedPosts,
			imageHash: platform.env.CF_IMAGES_HASH || ''
		};
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Failed to load post:', err);
		throw error(500, 'Unable to load post');
	}
};
