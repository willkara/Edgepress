import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Page {
	id: string;
	title: string;
	slug: string;
	content_md: string;
	content_html: string;
	excerpt: string | null;
	hero_image_id: string | null;
	status: 'draft' | 'published';
	template: string;
	published_at: string | null;
	updated_at: string;
	created_at: string;
	author_name: string;
}

export interface PageListItem {
	id: string;
	title: string;
	slug: string;
	status: 'draft' | 'published';
	template: string;
	published_at: string | null;
	updated_at: string;
	author_name: string;
}

/**
 * Get all pages with pagination (for admin)
 */
export async function getAllPages(db: D1Database, limit = 50, offset = 0): Promise<PageListItem[]> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.status, p.template,
			p.published_at, p.updated_at,
			u.display_name as author_name
		FROM pages p
		LEFT JOIN users u ON p.author_id = u.id
		ORDER BY p.updated_at DESC
		LIMIT ? OFFSET ?
	`;

	const result = await db.prepare(query).bind(limit, offset).all<PageListItem>();
	return result.results || [];
}

/**
 * Get a single page by slug (published only)
 */
export async function getPageBySlug(db: D1Database, slug: string): Promise<Page | null> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.status, p.template, p.published_at, p.updated_at, p.created_at,
			u.display_name as author_name
		FROM pages p
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.slug = ? AND p.status = 'published'
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(slug).first<Page>();
	return result || null;
}

/**
 * Get single page by slug with caching
 * TTL: 600 seconds (10 minutes) - pages change infrequently
 */
export async function getPageBySlugCached(
	db: D1Database,
	cache: KVNamespace,
	slug: string
): Promise<Page | null> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('page', slug);

	const cached = await getCached<Page | null>(cache, cacheKey);
	if (cached !== undefined) {
		return cached;
	}

	const page = await getPageBySlug(db, slug);
	await setCached(cache, cacheKey, page, 600);

	return page;
}

/**
 * Get page by ID (for admin editing)
 */
export async function getPageById(db: D1Database, id: string): Promise<Page | null> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.status, p.template, p.published_at, p.updated_at, p.created_at,
			u.display_name as author_name
		FROM pages p
		LEFT JOIN users u ON p.author_id = u.id
		WHERE p.id = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(id).first<Page>();
	return result || null;
}

/**
 * Get total count of pages
 */
export async function getPagesCount(db: D1Database): Promise<number> {
	const query = `SELECT COUNT(*) as count FROM pages`;
	const result = await db.prepare(query).first<{ count: number }>();
	return result?.count || 0;
}

/**
 * Create a new page
 */
export async function createPage(
	db: D1Database,
	data: {
		author_id: string;
		title: string;
		slug: string;
		content_md: string;
		content_html: string;
		excerpt?: string;
		hero_image_id?: string;
		status?: 'draft' | 'published';
		template?: string;
	}
): Promise<string> {
	const now = new Date().toISOString();
	const published_at = data.status === 'published' ? now : null;

	const query = `
		INSERT INTO pages (
			author_id, title, slug, content_md, content_html,
			excerpt, hero_image_id, status, template, published_at, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id
	`;

	const result = await db
		.prepare(query)
		.bind(
			data.author_id,
			data.title,
			data.slug,
			data.content_md,
			data.content_html,
			data.excerpt || null,
			data.hero_image_id || null,
			data.status || 'draft',
			data.template || 'page.njk',
			published_at,
			now,
			now
		)
		.first<{ id: string }>();

	if (!result?.id) {
		throw new Error('Failed to create page');
	}

	return result.id;
}

/**
 * Update an existing page
 */
export async function updatePage(
	db: D1Database,
	id: string,
	data: {
		title?: string;
		slug?: string;
		content_md?: string;
		content_html?: string;
		excerpt?: string;
		hero_image_id?: string;
		status?: 'draft' | 'published';
		template?: string;
	}
): Promise<void> {
	const now = new Date().toISOString();

	// Get current page to check if status changed
	const current = await getPageById(db, id);
	if (!current) {
		throw new Error('Page not found');
	}

	// If status changed to published and wasn't published before, set published_at
	const published_at =
		data.status === 'published' && current.status !== 'published'
			? now
			: current.published_at;

	const query = `
		UPDATE pages SET
			title = COALESCE(?, title),
			slug = COALESCE(?, slug),
			content_md = COALESCE(?, content_md),
			content_html = COALESCE(?, content_html),
			excerpt = COALESCE(?, excerpt),
			hero_image_id = COALESCE(?, hero_image_id),
			status = COALESCE(?, status),
			template = COALESCE(?, template),
			published_at = ?,
			updated_at = ?
		WHERE id = ?
	`;

	await db
		.prepare(query)
		.bind(
			data.title || null,
			data.slug || null,
			data.content_md || null,
			data.content_html || null,
			data.excerpt || null,
			data.hero_image_id || null,
			data.status || null,
			data.template || null,
			published_at,
			now,
			id
		)
		.run();

	// Invalidate cache if slug was updated
	if (data.slug && current.slug) {
		const { deleteCached, getCacheKey } = await import('$lib/server/cache/cache');
		// We need the cache KV, but we don't have it here. The API endpoint will handle cache invalidation.
	}
}

/**
 * Delete a page
 */
export async function deletePage(db: D1Database, id: string): Promise<void> {
	const query = `DELETE FROM pages WHERE id = ?`;
	await db.prepare(query).bind(id).run();
}

/**
 * Check if slug exists (for validation)
 */
export async function pageSlugExists(db: D1Database, slug: string, excludeId?: string): Promise<boolean> {
	let query = `SELECT COUNT(*) as count FROM pages WHERE slug = ?`;
	const bindings: any[] = [slug];

	if (excludeId) {
		query += ` AND id != ?`;
		bindings.push(excludeId);
	}

	const result = await db.prepare(query).bind(...bindings).first<{ count: number }>();
	return (result?.count || 0) > 0;
}

/**
 * Invalidate page cache
 */
export async function invalidatePageCache(cache: KVNamespace, slug: string): Promise<void> {
	const { deleteCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('page', slug);
	await deleteCached(cache, cacheKey);
}
