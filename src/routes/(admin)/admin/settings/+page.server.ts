import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getSettingsGroupCached } from '$lib/server/db/settings';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';

export const load: PageServerLoad = async ({ platform, locals, setHeaders }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB || !platform?.env?.CACHE) {
		throw error(500, 'Database or cache not available');
	}

	// Prevent caching of admin pages
	setCacheHeaders(setHeaders, CachePresets.noCache());

	try {
		const settings = await getSettingsGroupCached(platform.env.DB, platform.env.CACHE);
		return { settings };
	} catch (err: any) {
		console.error('Failed to load settings:', err);
		throw error(500, 'Failed to load settings');
	}
};
