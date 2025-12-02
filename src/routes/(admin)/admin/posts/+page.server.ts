import type { PageServerLoad } from './$types';
import { listPosts } from '$lib/server/db/admin-posts';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (!platform?.env?.DB) {
		return {
			posts: [],
			total: 0,
			currentPage: 1,
			totalPages: 0,
			filters: {
				status: 'all',
				search: ''
			}
		};
	}

	const db = platform.env.DB;

	// Parse query parameters
	const status = (url.searchParams.get('status') ?? 'all') as 'draft' | 'published' | 'all';
	const search = url.searchParams.get('search') ?? '';
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = 20;
	const offset = (page - 1) * limit;

	try {
		const result = await listPosts(db as D1Database, {
			status,
			search: search || undefined,
			limit,
			offset
		});

		const totalPages = Math.ceil(result.total / limit);

		return {
			posts: result.posts,
			total: result.total,
			currentPage: page,
			totalPages,
			filters: {
				status,
				search
			}
		};
	} catch (error) {
		console.error('Failed to load posts:', error);
		return {
			posts: [],
			total: 0,
			currentPage: 1,
			totalPages: 0,
			filters: {
				status: 'all',
				search: ''
			}
		};
	}
};
