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
                const parsedBody = (await request.json()) as unknown;
                if (!parsedBody || typeof parsedBody !== 'object') {
                        throw error(400, 'Invalid request body');
                }

                const { orders } = parsedBody as Record<string, unknown>;

                if (!Array.isArray(orders)) {
                        throw error(400, 'orders must be an array');
                }

                const updates = orders.map((entry) => {
                        if (!entry || typeof entry !== 'object') {
                                throw error(400, 'Each order must be an object');
                        }

                        const { id, display_order } = entry as Record<string, unknown>;

                        if (typeof id !== 'string' || id.trim().length === 0) {
                                throw error(400, 'Each order must include a valid id');
                        }

                        if (typeof display_order !== 'number') {
                                throw error(400, 'Each order must include a numeric display_order');
                        }

                        return { id, display_order };
                });

                await batchUpdateDisplayOrders(platform.env.DB, updates);

                return json({ success: true });
        } catch (err) {
                console.error('Failed to reorder projects:', err);
                throw error(500, err instanceof Error ? err.message : 'Failed to reorder projects');
        }
};
