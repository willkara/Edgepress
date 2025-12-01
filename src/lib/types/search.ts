import { z } from 'zod';

/** Schema describing a single search index entry. */
export const searchIndexItemSchema = z.object({
	slug: z.string(),
	title: z.string(),
	excerpt: z.string().nullable(),
	published_at: z.string(),
	reading_time: z.number().nullable(),
	tags: z.array(z.string())
});

/** Schema describing a search result entry with optional highlight metadata. */
export const searchResultSchema = searchIndexItemSchema.extend({
	highlight: z.string().nullable().optional()
});

export type SearchIndexItem = z.infer<typeof searchIndexItemSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
