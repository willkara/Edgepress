/**
 * Content Utilities
 *
 * Utilities for content processing including URL slug generation
 * and reading time estimation for blog posts
 */

/**
 * Generate a URL-friendly slug from a title
 * Converts to lowercase, removes special characters, and normalizes spacing
 * @param title - The title to convert to a slug
 * @returns URL-safe slug string
 * @example
 * generateSlug('Hello World!') // => 'hello-world'
 * generateSlug('TypeScript  & React') // => 'typescript-react'
 * generateSlug('  Spaced   Title  ') // => 'spaced-title'
 */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_-]+/g, '-') // Replace whitespace/underscores with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate estimated reading time in minutes based on word count
 * Uses average reading speed of 200 words per minute
 * @param content - The text content to analyze
 * @returns Estimated reading time in minutes (minimum 1)
 * @example
 * calculateReadingTime('Short text') // => 1
 * calculateReadingTime('A'.repeat(500)) // => 3 (500 words at 200 WPM)
 */
export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const wordCount = content.trim().split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute);
}
