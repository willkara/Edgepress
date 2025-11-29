import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { batchUpdateDisplayOrders } from '$lib/server/db/featured-projects';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const { orders } = await request.json();

		if (!Array.isArray(orders)) {
			throw error(400, 'orders must be an array');
		}

		await batchUpdateDisplayOrders(platform.env.DB, orders);

		return json({ success: true });
	} catch (err: any) {
		console.error('Failed to reorder projects:', err);
		throw error(500, err.message || 'Failed to reorder projects');
	}
};
