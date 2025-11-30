import { z } from 'zod';

/** Schema representing a category optionally enriched with post counts. */
export const categorySchema = z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        created_at: z.string(),
        post_count: z.number().optional()
});

/** Schema representing a tag optionally enriched with post counts. */
export const tagSchema = z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        created_at: z.string(),
        post_count: z.number().optional()
});

export type Category = z.infer<typeof categorySchema>;
export type Tag = z.infer<typeof tagSchema>;
