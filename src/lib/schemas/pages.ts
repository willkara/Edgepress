import { z } from 'zod';

/**
 * Page validation schemas
 *
 * These schemas validate input for page creation and updates,
 * providing runtime type safety and clear error messages.
 */

// Shared field validators
const titleSchema = z.string()
	.min(1, 'Title is required')
	.max(200, 'Title must be 200 characters or less');

const slugSchema = z.string()
	.min(1, 'Slug is required')
	.max(200, 'Slug must be 200 characters or less')
	.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
	.optional();

const contentMdSchema = z.string()
	.min(1, 'Content is required');

const contentHtmlSchema = z.string()
	.min(1, 'Rendered HTML content is required');

const excerptSchema = z.string()
	.max(500, 'Excerpt must be 500 characters or less')
	.nullable()
	.optional();

const heroImageIdSchema = z.string()
	.uuid('Hero image ID must be a valid UUID')
	.nullable()
	.optional();

const statusSchema = z.enum(['draft', 'published'], {
	errorMap: () => ({ message: 'Status must be either "draft" or "published"' })
});

const templateSchema = z.string()
	.max(100, 'Template name must be 100 characters or less')
	.optional()
	.default('page.njk');

/**
 * Schema for creating a new page
 *
 * Required fields:
 * - title: Page title (1-200 chars)
 * - content_md: Markdown content
 * - content_html: Rendered HTML
 *
 * Optional fields:
 * - slug: URL slug (auto-generated from title if not provided)
 * - excerpt: Short description (max 500 chars)
 * - hero_image_id: UUID of hero image
 * - status: 'draft' or 'published' (default: 'draft')
 * - template: Template name (default: 'page.njk')
 */
export const createPageSchema = z.object({
	title: titleSchema,
	slug: slugSchema,
	content_md: contentMdSchema,
	content_html: contentHtmlSchema,
	excerpt: excerptSchema,
	hero_image_id: heroImageIdSchema,
	status: statusSchema.optional().default('draft'),
	template: templateSchema
});

/**
 * Schema for updating an existing page
 *
 * All fields are optional (only include fields you want to update)
 */
export const updatePageSchema = z.object({
	title: titleSchema.optional(),
	slug: slugSchema,
	content_md: contentMdSchema.optional(),
	content_html: contentHtmlSchema.optional(),
	excerpt: excerptSchema,
	hero_image_id: heroImageIdSchema,
	status: statusSchema.optional(),
	template: templateSchema
}).refine(
	(data) => Object.keys(data).length > 0,
	{ message: 'At least one field must be provided for update' }
);

/**
 * Schema for query parameters when listing pages
 */
export const listPagesQuerySchema = z.object({
	limit: z.coerce.number()
		.int('Limit must be an integer')
		.min(1, 'Limit must be at least 1')
		.max(100, 'Limit must be 100 or less')
		.optional()
		.default(50),
	offset: z.coerce.number()
		.int('Offset must be an integer')
		.min(0, 'Offset must be 0 or greater')
		.optional()
		.default(0)
});

// Type exports for use in API handlers
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;
