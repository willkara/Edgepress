import type { D1Database } from '@cloudflare/workers-types';
import { error } from '@sveltejs/kit';
import { postSchema, postTagSchema, type PostTag } from '$lib/types/posts';
import type { PageServerLoad } from './$types';
import { z } from 'zod';

const previewPostSchema = postSchema.extend({
	preview_token: z.string().nullable(),
	preview_expires_at: z.string().nullable(),
	status: z.string()
});

type PreviewPost = z.infer<typeof previewPostSchema>;

/**
 * Get a post by preview token (includes unpublished posts)
 */
async function getPostByPreviewToken(db: D1Database, token: string): Promise<PreviewPost | null> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.published_at, p.updated_at, p.reading_time, p.view_count,
			p.preview_token, p.preview_expires_at, p.status,
			u.display_name as author_name,
			c.name as category_name, c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.preview_token = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(token).first<PreviewPost>();
	return result || null;
}

/**
 * Get all tags for a post
 */
async function getPostTags(db: D1Database, postId: string): Promise<PostTag[]> {
	const query = `
		SELECT t.id, t.name, t.slug
		FROM tags t
		INNER JOIN post_tags pt ON t.id = pt.tag_id
		WHERE pt.post_id = ?
		ORDER BY t.name ASC
	`;

	const result = await db.prepare(query).bind(postId).all<PostTag>();
	return result.results || [];
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const postRaw = await getPostByPreviewToken(platform.env.DB, params.token);
		const post = postRaw ? previewPostSchema.parse(postRaw) : null;

		if (!post) {
			throw error(404, 'Preview not found');
		}

		// Check if preview has expired
		if (post.preview_expires_at) {
			const expiresAt = new Date(post.preview_expires_at);
			const now = new Date();

			if (now > expiresAt) {
				throw error(410, 'Preview link has expired');
			}
		}

		const tagsRaw = await getPostTags(platform.env.DB, post.id);
		const tags = postTagSchema.array().parse(tagsRaw);

		return {
			post,
			tags,
			isPreview: true,
			relatedPosts: [] // Don't show related posts in preview mode
		};
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Failed to load preview:', err);
		throw error(500, 'Unable to load preview');
	}
};
