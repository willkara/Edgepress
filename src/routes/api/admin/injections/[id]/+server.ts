import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getInjectionById, updateInjection, deleteInjection } from '$lib/server/db/injections';
import type { UpdateInjectionInput } from '$lib/server/db/injections';

/**
 * Validation helpers
 */
type InjectionLocation = 'head' | 'body_start' | 'body_end' | 'post_before' | 'post_after';
const VALID_LOCATIONS: InjectionLocation[] = ['head', 'body_start', 'body_end', 'post_before', 'post_after'];
const NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;
const MAX_CONTENT_LENGTH = 50000; // 50KB

function validateName(name: unknown): asserts name is string {
	if (typeof name !== 'string' || name.trim().length === 0) {
		throw error(400, 'Name cannot be empty');
	}
	if (name.length > 100) {
		throw error(400, 'Name is too long (max 100 characters)');
	}
	if (!NAME_PATTERN.test(name)) {
		throw error(400, 'Name can only contain letters, numbers, hyphens, and underscores');
	}
}

function validateLocation(location: unknown): asserts location is InjectionLocation {
	if (typeof location !== 'string' || !VALID_LOCATIONS.includes(location as InjectionLocation)) {
		throw error(400, `Invalid location. Must be one of: ${VALID_LOCATIONS.join(', ')}`);
	}
}

function validateContent(content: unknown): asserts content is string {
	if (typeof content !== 'string') {
		throw error(400, 'Content is required');
	}
	if (content.length > MAX_CONTENT_LENGTH) {
		throw error(400, `Content is too long (max ${MAX_CONTENT_LENGTH} characters)`);
	}
}

function validateIsActive(isActive: unknown): asserts isActive is number {
	if (typeof isActive !== 'number' || (isActive !== 0 && isActive !== 1)) {
		throw error(400, 'is_active must be 0 or 1');
	}
}

/**
 * GET /api/admin/injections/[id]
 * Get a single injection point by ID
 */
export const GET: RequestHandler = async ({ params, platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const injection = await getInjectionById(platform.env.DB, params.id);

		if (!injection) {
			throw error(404, 'Injection not found');
		}

		return json(injection);
	} catch (err) {
		console.error('Failed to get injection:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to get injection');
	}
};

/**
 * PUT /api/admin/injections/[id]
 * Update an existing injection point
 */
export const PUT: RequestHandler = async ({ params, request, platform, locals }): Promise<Response> => {
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

                const { name, location, content, is_active } = parsedBody as Record<string, unknown>;
                const input: UpdateInjectionInput = {};

                if (name !== undefined) {
                        validateName(name);
                        input.name = name.trim();
                }

                if (location !== undefined) {
                        validateLocation(location);
                        input.location = location;
                }

                if (content !== undefined) {
                        validateContent(content);
                        input.content = content;
                }

                if (is_active !== undefined) {
                        validateIsActive(is_active);
                        input.is_active = is_active;
                }

		const injection = await updateInjection(platform.env.DB, params.id, input);
		return json(injection);
	} catch (err) {
		console.error('Failed to update injection:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to update injection');
	}
};

/**
 * DELETE /api/admin/injections/[id]
 * Delete an injection point
 */
export const DELETE: RequestHandler = async ({ params, platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		await deleteInjection(platform.env.DB, params.id);
		return json({ success: true });
	} catch (err) {
		console.error('Failed to delete injection:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to delete injection');
	}
};
