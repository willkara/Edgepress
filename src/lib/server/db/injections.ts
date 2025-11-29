import type { D1Database } from '@cloudflare/workers-types';

export interface InjectionPoint {
	id: string;
	name: string;
	location: 'head' | 'body_start' | 'body_end' | 'post_before' | 'post_after';
	content: string;
	is_active: number;
	created_at: string;
	updated_at: string;
}

export interface CreateInjectionInput {
	name: string;
	location: 'head' | 'body_start' | 'body_end' | 'post_before' | 'post_after';
	content: string;
	is_active?: number;
}

export interface UpdateInjectionInput {
	name?: string;
	location?: 'head' | 'body_start' | 'body_end' | 'post_before' | 'post_after';
	content?: string;
	is_active?: number;
}

export interface InjectionsGrouped {
	head: InjectionPoint[];
	body_start: InjectionPoint[];
	body_end: InjectionPoint[];
	post_before: InjectionPoint[];
	post_after: InjectionPoint[];
}

/**
 * Get all injection points ordered by name
 */
export async function getAllInjections(db: D1Database): Promise<InjectionPoint[]> {
	const query = 'SELECT * FROM injection_points ORDER BY name ASC';
	const result = await db.prepare(query).all<InjectionPoint>();
	return result.results || [];
}

/**
 * Get a single injection point by ID
 */
export async function getInjectionById(db: D1Database, id: string): Promise<InjectionPoint | null> {
	const query = 'SELECT * FROM injection_points WHERE id = ? LIMIT 1';
	const result = await db.prepare(query).bind(id).first<InjectionPoint>();
	return result || null;
}

/**
 * Get active injection points for a specific location
 */
export async function getActiveInjectionsByLocation(
	db: D1Database,
	location: string
): Promise<InjectionPoint[]> {
	const query =
		'SELECT * FROM injection_points WHERE location = ? AND is_active = 1 ORDER BY name ASC';
	const result = await db.prepare(query).bind(location).all<InjectionPoint>();
	return result.results || [];
}

/**
 * Get all active injection points grouped by location
 * This is optimized for frontend rendering
 */
export async function getActiveInjectionsGrouped(db: D1Database): Promise<InjectionsGrouped> {
	const query = 'SELECT * FROM injection_points WHERE is_active = 1 ORDER BY name ASC';
	const result = await db.prepare(query).all<InjectionPoint>();
	const injections = result.results || [];

	// Group by location
	const grouped: InjectionsGrouped = {
		head: [],
		body_start: [],
		body_end: [],
		post_before: [],
		post_after: []
	};

	for (const injection of injections) {
		if (grouped[injection.location]) {
			grouped[injection.location].push(injection);
		}
	}

	return grouped;
}

/**
 * Create a new injection point
 */
export async function createInjection(
	db: D1Database,
	input: CreateInjectionInput
): Promise<InjectionPoint> {
	const id = `inj_${crypto.randomUUID()}`;
	const now = new Date().toISOString();
	const isActive = input.is_active !== undefined ? input.is_active : 1;

	const query = `
		INSERT INTO injection_points (id, name, location, content, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`;

	await db
		.prepare(query)
		.bind(id, input.name, input.location, input.content, isActive, now, now)
		.run();

	const created = await getInjectionById(db, id);
	if (!created) {
		throw new Error('Failed to retrieve created injection');
	}

	return created;
}

/**
 * Update an existing injection point (partial update supported)
 */
export async function updateInjection(
	db: D1Database,
	id: string,
	input: UpdateInjectionInput
): Promise<InjectionPoint> {
	// First check if injection exists
	const existing = await getInjectionById(db, id);
	if (!existing) {
		throw new Error('Injection not found');
	}

	// Build dynamic update query based on provided fields
	const updates: string[] = [];
	const values: any[] = [];

	if (input.name !== undefined) {
		updates.push('name = ?');
		values.push(input.name);
	}
	if (input.location !== undefined) {
		updates.push('location = ?');
		values.push(input.location);
	}
	if (input.content !== undefined) {
		updates.push('content = ?');
		values.push(input.content);
	}
	if (input.is_active !== undefined) {
		updates.push('is_active = ?');
		values.push(input.is_active);
	}

	if (updates.length === 0) {
		return existing; // No changes to make
	}

	// Always update timestamp
	updates.push('updated_at = ?');
	values.push(new Date().toISOString());

	// Add ID at the end for WHERE clause
	values.push(id);

	const query = `UPDATE injection_points SET ${updates.join(', ')} WHERE id = ?`;
	await db
		.prepare(query)
		.bind(...values)
		.run();

	const updated = await getInjectionById(db, id);
	if (!updated) {
		throw new Error('Failed to retrieve updated injection');
	}

	return updated;
}

/**
 * Delete an injection point permanently
 */
export async function deleteInjection(db: D1Database, id: string): Promise<void> {
	const query = 'DELETE FROM injection_points WHERE id = ?';
	await db.prepare(query).bind(id).run();
}

/**
 * Toggle the active state of an injection point
 */
export async function toggleInjectionActive(
	db: D1Database,
	id: string,
	isActive: number
): Promise<InjectionPoint> {
	return await updateInjection(db, id, { is_active: isActive });
}
