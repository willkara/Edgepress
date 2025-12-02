import { z } from 'zod';

/** Schema describing a published post record loaded from the database. */
export const postSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	content_md: z.string(),
	content_html: z.string(),
	excerpt: z.string().nullable(),
	hero_image_id: z.string().nullable(),
	published_at: z.string(),
	updated_at: z.string(),
	reading_time: z.number().nullable(),
	view_count: z.number(),
	like_count: z.number().optional(),
	heart_count: z.number().optional(),
	bookmark_count: z.number().optional(),
	author_name: z.string().nullable(),
	category_name: z.string().nullable(),
	category_slug: z.string().nullable()
});

/** Schema describing a tag attached to a post. */
export const postTagSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string()
});

export type Post = z.infer<typeof postSchema>;
export type PostTag = z.infer<typeof postTagSchema>;
