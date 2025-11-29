import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllInjections, createInjection } from '$lib/server/db/injections';
import type { CreateInjectionInput } from '$lib/server/db/injections';

/**
 * Validation helpers
 */
const VALID_LOCATIONS = ['head', 'body_start', 'body_end', 'post_before', 'post_after'];
const NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;
const MAX_CONTENT_LENGTH = 50000; // 50KB

function validateName(name: string): void {
	if (!name || name.trim().length === 0) {
		throw error(400, 'Name is required');
	}
	if (name.length > 100) {
		throw error(400, 'Name is too long (max 100 characters)');
	}
	if (!NAME_PATTERN.test(name)) {
		throw error(400, 'Name can only contain letters, numbers, hyphens, and underscores');
	}
}

function validateLocation(location: string): void {
	if (!location) {
		throw error(400, 'Location is required');
	}
	if (!VALID_LOCATIONS.includes(location)) {
		throw error(400, `Invalid location. Must be one of: ${VALID_LOCATIONS.join(', ')}`);
	}
}

function validateContent(content: string): void {
	if (content === undefined || content === null) {
		throw error(400, 'Content is required');
	}
	if (content.length > MAX_CONTENT_LENGTH) {
		throw error(400, `Content is too long (max ${MAX_CONTENT_LENGTH} characters)`);
	}
}

function validateIsActive(isActive: any): void {
	if (isActive !== undefined && isActive !== 0 && isActive !== 1) {
		throw error(400, 'is_active must be 0 or 1');
	}
}

/**
 * GET /api/admin/injections
 * Get all injection points
 */
export const GET: RequestHandler = async ({ platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const injections = await getAllInjections(platform.env.DB);
		return json(injections);
	} catch (err) {
		console.error('Failed to get injections:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to get injections');
	}
};

/**
 * POST /api/admin/injections
 * Create a new injection point
 */
export const POST: RequestHandler = async ({ request, platform, locals }): Promise<Response> => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const body = await request.json();

		// Validate input
		validateName(body.name);
		validateLocation(body.location);
		validateContent(body.content);
		validateIsActive(body.is_active);

		const input: CreateInjectionInput = {
			name: body.name.trim(),
			location: body.location,
			content: body.content,
			is_active: body.is_active !== undefined ? body.is_active : 1
		};

		const injection = await createInjection(platform.env.DB, input);
		return json(injection, { status: 201 });
	} catch (err) {
		console.error('Failed to create injection:', err);

		// Re-throw if it's already a proper error
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, err instanceof Error ? err.message : 'Failed to create injection');
	}
};
