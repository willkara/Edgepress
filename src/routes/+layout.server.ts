import type { LayoutServerLoad } from './$types';
import { getActiveInjectionsGrouped, type InjectionsGrouped } from '$lib/server/db/injections';

const emptyInjections: InjectionsGrouped = {
	head: [],
	body_start: [],
	body_end: [],
	post_before: [],
	post_after: []
};

export const load: LayoutServerLoad = async ({ platform, locals }) => {
	let injections: InjectionsGrouped = emptyInjections;

	if (platform?.env?.DB) {
		try {
			injections = await getActiveInjectionsGrouped(platform.env.DB);
		} catch (error) {
			console.error('Failed to load injections:', error);
		}
	} else {
		// Explicitly await a resolved promise to satisfy @typescript-eslint/require-await
		// as this path doesn't have other awaits.
		await Promise.resolve();
	}

	return { injections, user: locals.user };
};
