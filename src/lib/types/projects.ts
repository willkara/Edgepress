import { z } from 'zod';

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
export const projectPostSchema = z.object({
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
        author_name: z.string(),
        category_name: z.string().nullable(),
        category_slug: z.string().nullable()
});

/** Schema for category records with an optional post count. */
export const categorySchema = z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        created_at: z.string(),
        post_count: z.number().optional()
});

export type FeaturedProject = z.infer<typeof featuredProjectSchema>;
export type ProjectPost = z.infer<typeof projectPostSchema>;
export type ProjectCategory = z.infer<typeof categorySchema>;
