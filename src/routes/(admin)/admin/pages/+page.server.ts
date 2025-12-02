import type { PageServerLoad } from './$types';
import { getAllPages, getPagesCount } from '$lib/server/db/pages';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return {
			pages: [],
			total: 0
		};
	}

	const db = platform.env.DB;

	try {
		const [pages, total] = await Promise.all([
			getAllPages(db, 100, 0), // Get all pages (typically < 100)
			getPagesCount(db)
		]);

		return {
			pages,
			total
		};
	} catch (error) {
		console.error('Failed to load pages:', error);
		return {
			pages: [],
			total: 0
		};
	}
};
