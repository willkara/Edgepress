import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostsByTag } from '$lib/server/db/posts';
import { getTagBySlug } from '$lib/server/db/tags';

export const load: PageServerLoad = async ({ params, platform }) => {
	const { slug } = params;

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		// Get the tag to verify it exists
		const tag = await getTagBySlug(platform.env.DB, slug);

		if (!tag) {
			throw error(404, `Tag "${slug}" not found`);
		}

		// Get all posts with this tag
		const posts = await getPostsByTag(platform.env.DB, slug, 100, 0);

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
