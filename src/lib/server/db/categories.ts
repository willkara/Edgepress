import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import type { QueryBindingValue } from './logger';
import { generateSlug } from '$lib/utils/slug';

export interface Category {
	id: string;
	name: string;
	slug: string;
	created_at: string;
	post_count?: number;
}

export interface CreateCategoryInput {
	name: string;
	slug?: string;
}

export interface UpdateCategoryInput {
	name?: string;
	slug?: string;
}

/**
 * Get all categories with optional post counts
 */
export async function getAllCategories(
	db: D1Database,
	includePostCount = true
): Promise<Category[]> {
	let query: string;

	if (includePostCount) {
		query = `
			SELECT
				c.id,
				c.name,
				c.slug,
				c.created_at,
				COUNT(p.id) as post_count
			FROM categories c
			LEFT JOIN posts p ON c.id = p.category_id
			GROUP BY c.id
			ORDER BY c.name ASC
		`;
	} else {
		query = `
			SELECT id, name, slug, created_at
			FROM categories
			ORDER BY name ASC
		`;
	}

	const result = await db.prepare(query).all<Category>();
	return result.results || [];
}

/**
 * Get a category by ID
 */
export async function getCategoryById(db: D1Database, id: string): Promise<Category | null> {
	const query = `
		SELECT
			c.id,
			c.name,
			c.slug,
			c.created_at,
			COUNT(p.id) as post_count
		FROM categories c
		LEFT JOIN posts p ON c.id = p.category_id
		WHERE c.id = ?
		GROUP BY c.id
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(id).first<Category>();
	return result || null;
}

/**
 * Get a category by slug
 */
export async function getCategoryBySlug(db: D1Database, slug: string): Promise<Category | null> {
	const query = `
		SELECT
			c.id,
			c.name,
			c.slug,
			c.created_at,
			COUNT(p.id) as post_count
		FROM categories c
		LEFT JOIN posts p ON c.id = p.category_id
		WHERE c.slug = ?
		GROUP BY c.id
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(slug).first<Category>();
	return result || null;
}

/**
 * Create a new category
 */
export async function createCategory(
	db: D1Database,
	input: CreateCategoryInput
): Promise<Category> {
	// Generate slug from name if not provided
	const slug = input.slug || generateSlug(input.name);

	// Check if slug already exists
	const existing = await getCategoryBySlug(db, slug);
	if (existing) {
		throw new Error(`Category with slug "${slug}" already exists`);
	}

	const id = `cat_${crypto.randomUUID()}`;
	const now = new Date().toISOString();

	const insertQuery = `
		INSERT INTO categories (id, name, slug, created_at)
		VALUES (?, ?, ?, ?)
		RETURNING id
	`;

	const result = await db
		.prepare(insertQuery)
		.bind(id, input.name, slug, now)
		.first<{ id: string }>();

	if (!result?.id) {
		throw new Error('Failed to create category');
	}

	const category = await getCategoryById(db, result.id);
	if (!category) {
		throw new Error('Failed to retrieve created category');
	}

	return category;
}

/**
 * Update a category
 */
export async function updateCategory(
	db: D1Database,
	id: string,
	input: UpdateCategoryInput
): Promise<Category> {
	const updates: string[] = [];
	const bindings: QueryBindingValue[] = [];

	if (input.name !== undefined) {
		updates.push('name = ?');
		bindings.push(input.name);
	}

	if (input.slug !== undefined) {
		// Check if slug is unique (excluding current category)
		const existing = await getCategoryBySlug(db, input.slug);
		if (existing && existing.id !== id) {
			throw new Error(`Category with slug "${input.slug}" already exists`);
		}

		updates.push('slug = ?');
		bindings.push(input.slug);
	}

	if (updates.length === 0) {
		// No changes, just return current category
		const category = await getCategoryById(db, id);
		if (!category) {
			throw new Error('Category not found');
		}
		return category;
	}

	bindings.push(id);

	const updateQuery = `
		UPDATE categories
		SET ${updates.join(', ')}
		WHERE id = ?
	`;

	await db
		.prepare(updateQuery)
		.bind(...bindings)
		.run();

	const category = await getCategoryById(db, id);
	if (!category) {
		throw new Error('Category not found');
	}

	return category;
}

/**
 * Delete a category
 */
export async function deleteCategory(db: D1Database, id: string): Promise<void> {
	// Check if category exists
	const category = await getCategoryById(db, id);
	if (!category) {
		throw new Error('Category not found');
	}

	// Note: Posts with this category_id will be set to NULL (ON DELETE SET NULL)
	await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
}

/**
 * Get the number of posts in a category
 */
export async function getCategoryPostCount(db: D1Database, id: string): Promise<number> {
	const query = `
		SELECT COUNT(*) as count
		FROM posts
		WHERE category_id = ?
	`;

	const result = await db.prepare(query).bind(id).first<{ count: number }>();
	return result?.count || 0;
}

/**
 * Check if a slug is available (not used by another category)
 */
export async function isSlugAvailable(
	db: D1Database,
	slug: string,
	excludeCategoryId?: string
): Promise<boolean> {
	let query = 'SELECT COUNT(*) as count FROM categories WHERE slug = ?';
	const bindings: QueryBindingValue[] = [slug];

	if (excludeCategoryId) {
		query += ' AND id != ?';
		bindings.push(excludeCategoryId);
	}

	const result = await db
		.prepare(query)
		.bind(...bindings)
		.first<{ count: number }>();
	return (result?.count || 0) === 0;
}

/**
 * Get all categories with caching
 * TTL: 1800 seconds (30 minutes) - categories change infrequently
 */
export async function getAllCategoriesCached(
	db: D1Database,
	cache: KVNamespace,
	includePostCount = true
): Promise<Category[]> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('categories:all', includePostCount ? 'with-count' : 'no-count');

	const cached = await getCached<Category[]>(cache, cacheKey);
	if (cached) {
		return cached;
	}

	const categories = await getAllCategories(db, includePostCount);
	await setCached(cache, cacheKey, categories, 1800);

	return categories;
}
