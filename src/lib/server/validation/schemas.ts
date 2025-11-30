import { z } from 'zod';

// Helper to validate slugs
const slugSchema = z
	.string()
	.min(1, 'Slug is required')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const ProjectSchema = z.object({
	title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
	slug: slugSchema,
	description: z.string().min(1, 'Description is required'),
	content_md: z.string().optional().nullable(),
	repo_url: z
		.string()
		.url('Invalid URL')
		.optional()
		.nullable()
		.or(z.literal('')),
	demo_url: z
		.string()
		.url('Invalid URL')
		.optional()
		.nullable()
		.or(z.literal('')),
	hero_image_id: z.string().optional().nullable().or(z.literal('')),
	is_featured: z.boolean().default(false),
	// Superforms handles text input for tech_stack better as a string, we parse it later
	tech_stack_input: z.string().optional()
});

export type ProjectFormSchema = typeof ProjectSchema;
