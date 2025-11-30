import { z } from 'zod';
import { postSchema } from './posts';
import { categorySchema as taxonomyCategorySchema } from './taxonomy';

/** Schema representing a featured project row joined with its post metadata. */
export const featuredProjectSchema = z.object({
	id: z.string(),
	post_id: z.string(),
	display_order: z.number(),
	custom_description: z.string().nullable(),
	is_featured: z.number(),
	post_title: z.string(),
	post_slug: z.string(),
	post_excerpt: z.string().nullable(),
	post_hero_image_id: z.string().nullable(),
	post_published_at: z.string(),
	category_name: z.string().nullable(),
	tags: z.array(z.string())
});

/** Schema describing a published post record used by the projects and home pages. */
export const projectPostSchema = postSchema;

/** Schema for category records with an optional post count. */
export const categorySchema = taxonomyCategorySchema;

export type FeaturedProject = z.infer<typeof featuredProjectSchema>;
export type ProjectPost = z.infer<typeof projectPostSchema>;
export type ProjectCategory = z.infer<typeof categorySchema>;
