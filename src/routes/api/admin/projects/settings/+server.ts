import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setMultipleSettings } from '$lib/server/db/settings';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const parsedBody = (await request.json()) as unknown;
		if (!parsedBody || typeof parsedBody !== 'object') {
			throw error(400, 'Invalid request body');
		}

		const { pageTitle, pageSubtitle, showAll } = parsedBody as Record<string, unknown>;

		if (pageTitle !== undefined && typeof pageTitle !== 'string') {
			throw error(400, 'pageTitle must be a string');
		}

		if (pageSubtitle !== undefined && typeof pageSubtitle !== 'string') {
			throw error(400, 'pageSubtitle must be a string');
		}

		if (showAll !== undefined && typeof showAll !== 'boolean') {
			throw error(400, 'showAll must be a boolean');
		}

		const settings: Record<string, string> = {
			projects_page_title:
				typeof pageTitle === 'string' && pageTitle.length > 0 ? pageTitle : 'My Projects',
			projects_page_subtitle:
				typeof pageSubtitle === 'string' && pageSubtitle.length > 0
					? pageSubtitle
					: "Explore the things I've built and the problems I've solved.",
			projects_page_show_all: showAll ? '1' : '0'
		};

		await setMultipleSettings(platform.env.DB, settings);

		return json({ success: true });
	} catch (err) {
		console.error('Failed to save projects settings:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to save projects settings');
	}
};
