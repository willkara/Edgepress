import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPageBySlugCached } from '$lib/server/db/pages';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';

/**
 * Ghost-style catch-all route handler
 *
 * This route only activates when no more specific route matches.
 * It handles static pages like /about, /contact, /privacy, etc.
 *
 * Route Priority (SvelteKit):
 * 1. Exact matches:     / → +page.svelte
 * 2. Dynamic segments:  /blog/[slug] → blog/[slug]/+page.svelte
 * 3. Catch-all (this):  /anything → [...slug]/+page.server.ts
 */
export const load: PageServerLoad = async ({ params, platform, setHeaders }) => {
	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		throw error(500, 'Database not available');
	}

	// Convert params.slug to a clean slug string
	// params.slug is undefined for "/" or a string like "about" or "about/contact"
	const slug = params.slug || 'index';

	try {
		// Look up page in database with caching (10 min TTL)
		const page = await getPageBySlugCached(
			platform.env.DB,
			platform.env.CACHE,
			slug
		);

		if (page?.status !== 'published') {
			throw error(404, `Page not found: /${slug}`);
		}

		// Cache for 10 minutes (static pages rarely change)
		setCacheHeaders(setHeaders, CachePresets.publicPage());

		// Resolve template using Ghost-style hierarchy
		const template = resolveTemplate(page);

		return {
			page,
			template,
			context: {
				type: 'page' as const,
				slug: page.slug
			},
			imageHash: platform.env.CF_IMAGES_HASH || ''
		};
	} catch (err: any) {
		// If it's already a 404 error, re-throw it
		if (err.status === 404) {
			throw err;
		}

		console.error('Failed to load page:', err);
		throw error(500, 'Unable to load page');
	}
};

/**
 * Resolve template using Ghost-style hierarchy
 *
 * Template Priority:
 * 1. Custom template from database (page.template field)
 * 2. Slug-specific template: page-{slug}.njk
 * 3. Generic page template: page.njk
 * 4. Default template: default.njk (ultimate fallback)
 *
 * Later: When theme system is implemented, this will check filesystem
 * For now: We return the template name and let the component handle it
 */
function resolveTemplate(page: { slug: string; template: string }): string {
	// If page has a custom template set, use it
	if (page.template && page.template !== 'page.njk') {
		return page.template;
	}

	// Otherwise, follow Ghost hierarchy
	const candidates = [
		`page-${page.slug}.njk`,  // e.g., page-about.njk for /about
		'page.njk',                // Generic page template
		'default.njk'              // Ultimate fallback
	];

	// For now, return the first candidate (slug-specific)
	// Later: Check which templates exist in the active theme
	return candidates[0];
}
