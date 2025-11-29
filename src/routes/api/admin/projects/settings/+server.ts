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
		const { pageTitle, pageSubtitle, showAll } = await request.json();

		const settings: Record<string, string> = {
			projects_page_title: pageTitle || 'My Projects',
			projects_page_subtitle:
				pageSubtitle || "Explore the things I've built and the problems I've solved.",
			projects_page_show_all: showAll ? '1' : '0'
		};

		await setMultipleSettings(platform.env.DB, settings);

		return json({ success: true });
	} catch (err: any) {
		console.error('Failed to save projects settings:', err);
		throw error(500, err.message || 'Failed to save projects settings');
	}
};
