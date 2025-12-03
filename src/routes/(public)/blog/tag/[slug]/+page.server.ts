import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostsByTag } from '$lib/server/db/posts';
import { getTagBySlug } from '$lib/server/db/tags';
import { postSchema } from '$lib/types/posts';
import { tagSchema } from '$lib/types/taxonomy';

export const load: PageServerLoad = async ({ params, platform }) => {
	const { slug } = params;

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		// Get the tag to verify it exists
		const tagRaw = await getTagBySlug(platform.env.DB as D1Database, slug);

		if (!tagRaw) {
			throw error(404, `Tag "${slug}" not found`);
		}

		const tag = tagSchema.parse(tagRaw);

		// Get all posts with this tag
		const postsRaw = await getPostsByTag(platform.env.DB as D1Database, slug, 100, 0);
		const posts = postSchema.array().parse(postsRaw);

		return {
			tag,
			posts,
			imageHash: platform.env.CF_IMAGES_HASH || ''
		};
	} catch (err: unknown) {
		if (
			err &&
			typeof err === 'object' &&
			'status' in err &&
			(err as { status?: number }).status === 404
		) {
			throw err;
		}
		console.error('Failed to load tag page:', err);
		throw error(500, 'Failed to load tag page');
	}
};
