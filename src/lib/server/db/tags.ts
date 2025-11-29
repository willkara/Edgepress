import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { generateSlug } from '$lib/utils/slug';

export interface Tag {
	id: string;
	name: string;
	slug: string;
	created_at: string;
	post_count?: number;
}

export interface CreateTagInput {
	name: string;
	slug?: string;
}

export interface UpdateTagInput {
	name?: string;
	slug?: string;
}

/**
 * Get all tags with optional post counts
 */
export async function getAllTags(db: D1Database, includePostCount = true): Promise<Tag[]> {
	let query: string;

	if (includePostCount) {
		query = `
			SELECT
				t.id,
				t.name,
				t.slug,
				t.created_at,
				COUNT(pt.post_id) as post_count
			FROM tags t
			LEFT JOIN post_tags pt ON t.id = pt.tag_id
			GROUP BY t.id
			ORDER BY t.name ASC
		`;
	} else {
		query = `
			SELECT id, name, slug, created_at
			FROM tags
			ORDER BY name ASC
		`;
	}

	const result = await db.prepare(query).all<Tag>();
	return result.results || [];
}

/**
 * Get a tag by ID
 */
export async function getTagById(db: D1Database, id: string): Promise<Tag | null> {
	const query = `
		SELECT
			t.id,
			t.name,
			t.slug,
			t.created_at,
			COUNT(pt.post_id) as post_count
		FROM tags t
		LEFT JOIN post_tags pt ON t.id = pt.tag_id
		WHERE t.id = ?
		GROUP BY t.id
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(id).first<Tag>();
	return result || null;
}

/**
 * Get a tag by slug
 */
export async function getTagBySlug(db: D1Database, slug: string): Promise<Tag | null> {
	const query = `
		SELECT
			t.id,
			t.name,
			t.slug,
			t.created_at,
			COUNT(pt.post_id) as post_count
		FROM tags t
		LEFT JOIN post_tags pt ON t.id = pt.tag_id
		WHERE t.slug = ?
		GROUP BY t.id
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(slug).first<Tag>();
	return result || null;
}

/**
 * Create a new tag
 */
export async function createTag(db: D1Database, input: CreateTagInput): Promise<Tag> {
	// Generate slug from name if not provided
	const slug = input.slug || generateSlug(input.name);

	// Check if slug already exists
	const existing = await getTagBySlug(db, slug);
	if (existing) {
		throw new Error(`Tag with slug "${slug}" already exists`);
	}

	const id = `tag_${crypto.randomUUID()}`;
	const now = new Date().toISOString();

	const insertQuery = `
		INSERT INTO tags (id, name, slug, created_at)
		VALUES (?, ?, ?, ?)
		RETURNING id
	`;

	const result = await db
		.prepare(insertQuery)
		.bind(id, input.name, slug, now)
		.first<{ id: string }>();

	if (!result?.id) {
		throw new Error('Failed to create tag');
	}

	const tag = await getTagById(db, result.id);
	if (!tag) {
		throw new Error('Failed to retrieve created tag');
	}

	return tag;
}

/**
 * Update a tag
 */
export async function updateTag(db: D1Database, id: string, input: UpdateTagInput): Promise<Tag> {
	const updates: string[] = [];
	const bindings: any[] = [];

	if (input.name !== undefined) {
		updates.push('name = ?');
		bindings.push(input.name);
	}

	if (input.slug !== undefined) {
		// Check if slug is unique (excluding current tag)
		const existing = await getTagBySlug(db, input.slug);
		if (existing && existing.id !== id) {
			throw new Error(`Tag with slug "${input.slug}" already exists`);
		}

		updates.push('slug = ?');
		bindings.push(input.slug);
	}

	if (updates.length === 0) {
		// No changes, just return current tag
		const tag = await getTagById(db, id);
		if (!tag) {
			throw new Error('Tag not found');
		}
		return tag;
	}

	bindings.push(id);

	const updateQuery = `
		UPDATE tags
		SET ${updates.join(', ')}
		WHERE id = ?
	`;

	await db
		.prepare(updateQuery)
		.bind(...bindings)
		.run();

	const tag = await getTagById(db, id);
	if (!tag) {
		throw new Error('Tag not found');
	}

	return tag;
}

/**
 * Delete a tag
 */
export async function deleteTag(db: D1Database, id: string): Promise<void> {
	// Check if tag exists
	const tag = await getTagById(db, id);
	if (!tag) {
		throw new Error('Tag not found');
	}

	// Note: post_tags entries will be automatically deleted (ON DELETE CASCADE)
	await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
}

/**
 * Get the number of posts using a tag
 */
export async function getTagPostCount(db: D1Database, id: string): Promise<number> {
	const query = `
		SELECT COUNT(*) as count
		FROM post_tags
		WHERE tag_id = ?
	`;

	const result = await db.prepare(query).bind(id).first<{ count: number }>();
	return result?.count || 0;
}

/**
 * Check if a slug is available (not used by another tag)
 */
export async function isSlugAvailable(
	db: D1Database,
	slug: string,
	excludeTagId?: string
): Promise<boolean> {
	let query = 'SELECT COUNT(*) as count FROM tags WHERE slug = ?';
	const bindings: any[] = [slug];

	if (excludeTagId) {
		query += ' AND id != ?';
		bindings.push(excludeTagId);
	}

	const result = await db
		.prepare(query)
		.bind(...bindings)
		.first<{ count: number }>();
	return (result?.count || 0) === 0;
}

/**
 * Get all tags with caching
 * TTL: 1800 seconds (30 minutes) - tags change infrequently
 */
export async function getAllTagsCached(
	db: D1Database,
	cache: KVNamespace,
	includePostCount = true
): Promise<Tag[]> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('tags:all', includePostCount ? 'with-count' : 'no-count');

	const cached = await getCached<Tag[]>(cache, cacheKey);
	if (cached) {
		return cached;
	}

	const tags = await getAllTags(db, includePostCount);
	await setCached(cache, cacheKey, tags, 1800);

	return tags;
}
