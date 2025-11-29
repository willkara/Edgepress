/**
 * HTML Sanitization Utilities
 *
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks
 * Provides specialized sanitization for admin-controlled content injections
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content for admin-controlled injections
 * Allows script and style tags since injections are managed by administrators
 * Used for analytics scripts, custom CSS, and other admin-added code
 *
 * WARNING: Only use for admin-controlled content! Never use for user-generated content.
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML safe for injection into the DOM
 * @example
 * sanitizeInjection('<script>console.log("Admin analytics")</script>')
 * // => '<script>console.log("Admin analytics")</script>'
 */
export function sanitizeInjection(html: string): string {
	return DOMPurify.sanitize(html, {
		ADD_TAGS: ['script', 'style'],
		ADD_ATTR: ['async', 'defer', 'src', 'type', 'class', 'id', 'rel', 'href', 'crossorigin'],
		ALLOW_UNKNOWN_PROTOCOLS: true
	});
}
