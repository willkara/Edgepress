import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettingsGroup, setMultipleSettings } from '$lib/server/db/settings';
import { requireEnv } from '$lib/server/env';

/**
 * Validation helpers
 */
function isValidEmail(email: string): boolean {
	if (email === '') {
		return true;
	} // Empty is allowed
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
	if (url === '') {
		return true;
	} // Empty is allowed
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * GET /api/admin/settings
 * Get all settings grouped by category
 */
export const GET: RequestHandler = async (event): Promise<Response> => {
	const { locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB']);

	try {
		const settings = await getSettingsGroup(env.DB);
		return json(settings);
	} catch (err) {
		console.error('Failed to get settings:', err);
		const message = err instanceof Error ? err.message : 'Failed to get settings';
		throw error(500, message);
	}
};

/**
 * PUT /api/admin/settings
 * Update multiple settings atomically
 */
export const PUT: RequestHandler = async (event): Promise<Response> => {
	const { request, locals } = event;
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const env = requireEnv(event, ['DB']);

	try {
		const rawBody = (await request.json()) as unknown;
		const body =
			rawBody && typeof rawBody === 'object'
				? (rawBody as {
						general?: Record<string, unknown>;
						author?: Record<string, unknown>;
						social?: Record<string, unknown>;
						seo?: Record<string, unknown>;
					})
				: {};

		// Flatten the nested settings object to key-value pairs
		const flatSettings: Record<string, string> = {};

		// Validate and flatten general settings
		if (body.general && typeof body.general === 'object') {
			if (typeof body.general.site_title === 'string') {
				const title = body.general.site_title.trim();
				if (title.length === 0) {
					throw error(400, 'Site title is required');
				}
				if (title.length > 100) {
					throw error(400, 'Site title is too long (max 100 characters)');
				}
				flatSettings.site_title = title;
			}

			if (typeof body.general.site_description === 'string') {
				const desc = body.general.site_description.trim();
				if (desc.length > 500) {
					throw error(400, 'Site description is too long (max 500 characters)');
				}
				flatSettings.site_description = desc;
			}

			if (typeof body.general.site_tagline === 'string') {
				const tagline = body.general.site_tagline.trim();
				if (tagline.length > 100) {
					throw error(400, 'Site tagline is too long (max 100 characters)');
				}
				flatSettings.site_tagline = tagline;
			}
		}

		// Validate and flatten author settings
		if (body.author && typeof body.author === 'object') {
			if (typeof body.author.author_name === 'string') {
				const name = body.author.author_name.trim();
				if (name.length > 100) {
					throw error(400, 'Author name is too long (max 100 characters)');
				}
				flatSettings.author_name = name;
			}

			if (typeof body.author.author_bio === 'string') {
				const bio = body.author.author_bio.trim();
				if (bio.length > 1000) {
					throw error(400, 'Author bio is too long (max 1000 characters)');
				}
				flatSettings.author_bio = bio;
			}

			if (typeof body.author.author_email === 'string') {
				const email = body.author.author_email.trim();
				if (!isValidEmail(email)) {
					throw error(400, 'Invalid email format');
				}
				flatSettings.author_email = email;
			}
		}

		// Validate and flatten social settings
		if (body.social && typeof body.social === 'object') {
			if (typeof body.social.twitter_url === 'string') {
				const url = body.social.twitter_url.trim();
				if (!isValidUrl(url)) {
					throw error(400, 'Invalid Twitter URL format');
				}
				flatSettings.twitter_url = url;
			}

			if (typeof body.social.github_url === 'string') {
				const url = body.social.github_url.trim();
				if (!isValidUrl(url)) {
					throw error(400, 'Invalid GitHub URL format');
				}
				flatSettings.github_url = url;
			}

			if (typeof body.social.linkedin_url === 'string') {
				const url = body.social.linkedin_url.trim();
				if (!isValidUrl(url)) {
					throw error(400, 'Invalid LinkedIn URL format');
				}
				flatSettings.linkedin_url = url;
			}
		}

		// Validate and flatten SEO settings
		if (body.seo && typeof body.seo === 'object') {
			if (typeof body.seo.meta_title_suffix === 'string') {
				const suffix = body.seo.meta_title_suffix.trim();
				if (suffix.length > 50) {
					throw error(400, 'Meta title suffix is too long (max 50 characters)');
				}
				flatSettings.meta_title_suffix = suffix;
			}

			if (typeof body.seo.meta_description_default === 'string') {
				const desc = body.seo.meta_description_default.trim();
				if (desc.length > 160) {
					throw error(400, 'Meta description is too long (max 160 characters)');
				}
				flatSettings.meta_description_default = desc;
			}

			if (typeof body.seo.og_image_url === 'string') {
				const url = body.seo.og_image_url.trim();
				if (!isValidUrl(url)) {
					throw error(400, 'Invalid OpenGraph image URL format');
				}
				flatSettings.og_image_url = url;
			}
		}

		// Update settings in database
		if (Object.keys(flatSettings).length > 0) {
			await setMultipleSettings(env.DB, flatSettings);

			if (env.CACHE) {
				const { invalidateCache } = await import('$lib/server/cache/cache');
				await invalidateCache(env.CACHE, 'settings:all');
			}
		}

		// Return updated settings
		const updatedSettings = await getSettingsGroup(env.DB);
		return json(updatedSettings);
	} catch (err) {
		console.error('Failed to update settings:', err);

		// Re-throw if it's already a proper error
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to update settings';
		throw error(500, message);
	}
};
