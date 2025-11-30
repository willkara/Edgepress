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
                const tagRaw = await getTagBySlug(platform.env.DB, slug);

                if (!tagRaw) {
                        throw error(404, `Tag "${slug}" not found`);
                }

                const tag = tagSchema.parse(tagRaw);

                // Get all posts with this tag
                const postsRaw = await getPostsByTag(platform.env.DB, slug, 100, 0);
                const posts = postSchema.array().parse(postsRaw);

		return {
			tag,
			posts
		};
	} catch (err: any) {
		if (err.status === 404) {
			throw err;
		}
		console.error('Failed to load tag page:', err);
		throw error(500, 'Failed to load tag page');
	}
};
