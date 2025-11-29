import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Post {
	id: string;
	title: string;
	slug: string;
	content_md: string;
	content_html: string;
	excerpt: string | null;
	hero_image_id: string | null;
	published_at: string;
	reading_time: number | null;
	view_count: number;
	author_name: string;
	category_name: string | null;
	category_slug: string | null;
}

export interface PostTag {
	id: string;
	name: string;
	slug: string;
}

export interface SearchIndexItem {
	slug: string;
	title: string;
	excerpt: string | null;
	published_at: string;
	reading_time: number | null;
	tags: string[];
}

export interface SearchResult extends SearchIndexItem {
	highlight?: string | null;
}

/**
 * Get all published posts with pagination
 */
export async function getPublishedPosts(db: D1Database, limit = 20, offset = 0): Promise<Post[]> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.published_at, p.reading_time, p.view_count,
			u.display_name as author_name,
			c.name as category_name, c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.status = 'published' AND p.published_at <= ?
		ORDER BY p.published_at DESC
		LIMIT ? OFFSET ?
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(query).bind(now, limit, offset).all<Post>();
	return result.results || [];
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(db: D1Database, slug: string): Promise<Post | null> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.published_at, p.reading_time, p.view_count,
			u.display_name as author_name,
			c.name as category_name, c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.slug = ? AND p.status = 'published' AND p.published_at <= ?
		LIMIT 1
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(query).bind(slug, now).first<Post>();
	return result || null;
}

/**
 * Get all tags for a post
 */
export async function getPostTags(db: D1Database, postId: string): Promise<PostTag[]> {
	const query = `
		SELECT t.id, t.name, t.slug
		FROM tags t
		INNER JOIN post_tags pt ON t.id = pt.tag_id
		WHERE pt.post_id = ?
		ORDER BY t.name ASC
	`;

	const result = await db.prepare(query).bind(postId).all<PostTag>();
	return result.results || [];
}

/**
 * Get total count of published posts
 */
export async function getPublishedPostsCount(db: D1Database): Promise<number> {
	const query = `
		SELECT COUNT(*) as count
		FROM posts
		WHERE status = 'published' AND published_at <= ?
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(query).bind(now).first<{ count: number }>();
	return result?.count || 0;
}

/**
 * Get published posts by category slug with pagination
 */
export async function getPostsByCategory(
	db: D1Database,
	categorySlug: string,
	limit = 20,
	offset = 0
): Promise<Post[]> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.published_at, p.reading_time, p.view_count,
			u.display_name as author_name,
			c.name as category_name, c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		INNER JOIN categories c ON p.category_id = c.id
		WHERE c.slug = ? AND p.status = 'published' AND p.published_at <= ?
		ORDER BY p.published_at DESC
		LIMIT ? OFFSET ?
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(query).bind(categorySlug, now, limit, offset).all<Post>();
	return result.results || [];
}

/**
 * Get published posts by tag slug with pagination
 */
export async function getPostsByTag(
	db: D1Database,
	tagSlug: string,
	limit = 20,
	offset = 0
): Promise<Post[]> {
	const query = `
		SELECT
			p.id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
			p.hero_image_id, p.published_at, p.reading_time, p.view_count,
			u.display_name as author_name,
			c.name as category_name, c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		INNER JOIN post_tags pt ON p.id = pt.post_id
		INNER JOIN tags t ON pt.tag_id = t.id
		WHERE t.slug = ? AND p.status = 'published' AND p.published_at <= ?
		ORDER BY p.published_at DESC
		LIMIT ? OFFSET ?
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(query).bind(tagSlug, now, limit, offset).all<Post>();
	return result.results || [];
}

/**
 * Get published posts with caching
 * TTL: 300 seconds (5 minutes) - balances freshness with performance
 */
export async function getPublishedPostsCached(
	db: D1Database,
	cache: KVNamespace,
	limit = 20,
	offset = 0
): Promise<Post[]> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('posts:published', limit, offset);

	const cached = await getCached<Post[]>(cache, cacheKey);
	if (cached) {
		return cached;
	}

	const posts = await getPublishedPosts(db, limit, offset);
	await setCached(cache, cacheKey, posts, 300);

	return posts;
}

/**
 * Get single post by slug with caching
 * TTL: 600 seconds (10 minutes) - individual posts change less frequently
 */
export async function getPostBySlugCached(
	db: D1Database,
	cache: KVNamespace,
	slug: string
): Promise<Post | null> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('post', slug);

	const cached = await getCached<Post | null>(cache, cacheKey);
	if (cached !== undefined) {
		return cached;
	}

	const post = await getPostBySlug(db, slug);
	await setCached(cache, cacheKey, post, 600);

	return post;
}

/**
 * Build a lightweight search index (client-side)
 */
export async function getSearchIndex(db: D1Database, limit = 500): Promise<SearchIndexItem[]> {
	const query = `
		SELECT
			p.slug,
			p.title,
			COALESCE(p.excerpt, substr(p.content_md, 1, 200)) AS excerpt,
			p.published_at,
			p.reading_time,
			GROUP_CONCAT(t.name, '|') AS tags
		FROM posts p
		LEFT JOIN post_tags pt ON pt.post_id = p.id
		LEFT JOIN tags t ON t.id = pt.tag_id
		WHERE p.status = 'published' AND p.published_at <= ?
		GROUP BY p.id
		ORDER BY p.published_at DESC
		LIMIT ?
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(query).bind(now, limit).all<{
		slug: string;
		title: string;
		excerpt: string | null;
		published_at: string;
		reading_time: number | null;
		tags: string | null;
	}>();

	const rows = result.results || [];
	return rows.map((row) => ({
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		published_at: row.published_at,
		reading_time: row.reading_time,
		tags: row.tags ? row.tags.split('|') : []
	}));
}

/**
 * Cached search index
 */
export async function getSearchIndexCached(
	db: D1Database,
	cache: KVNamespace,
	limit = 500
): Promise<SearchIndexItem[]> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const cacheKey = getCacheKey('search:index', limit);

	const cached = await getCached<SearchIndexItem[]>(cache, cacheKey);
	if (cached) {
		return cached;
	}

	const index = await getSearchIndex(db, limit);
	await setCached(cache, cacheKey, index, 900);
	return index;
}

/**
 * Server-side FTS search using D1 FTS5
 */
export async function searchPosts(
	db: D1Database,
	query: string,
	limit = 20
): Promise<SearchResult[]> {
	const normalizedTokens = query
		.trim()
		.split(/\s+/)
		.filter((t) => t.length > 0)
		.map((t) => t.replace(/["']/g, ''));

	if (normalizedTokens.length === 0) {
		return [];
	}

	const ftsQuery = normalizedTokens.map((t) => `${t}*`).join(' ');

	const sql = `
		SELECT
			p.slug,
			p.title,
			COALESCE(p.excerpt, substr(p.content_md, 1, 200)) AS excerpt,
			p.published_at,
			p.reading_time,
			snippet(posts_fts, 1, '', '', ' … ', 8) AS highlight,
			GROUP_CONCAT(t.name, '|') AS tags
		FROM posts_fts
		JOIN posts p ON p.rowid = posts_fts.rowid
		LEFT JOIN post_tags pt ON pt.post_id = p.id
		LEFT JOIN tags t ON t.id = pt.tag_id
		WHERE posts_fts MATCH ? AND p.status = 'published' AND p.published_at <= ?
		GROUP BY p.id
		ORDER BY bm25(posts_fts) ASC
		LIMIT ?
	`;

	const now = new Date().toISOString();
	const result = await db.prepare(sql).bind(ftsQuery, now, limit).all<{
		slug: string;
		title: string;
		excerpt: string | null;
		published_at: string;
		reading_time: number | null;
		highlight: string | null;
		tags: string | null;
	}>();

	const rows = result.results || [];
	return rows.map((row) => ({
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		published_at: row.published_at,
		reading_time: row.reading_time,
		highlight: row.highlight || row.excerpt,
		tags: row.tags ? row.tags.split('|') : []
	}));
}

/**
 * Cached server-side FTS search (short TTL)
 */
export async function searchPostsCached(
	db: D1Database,
	cache: KVNamespace,
	query: string,
	limit = 20
): Promise<SearchResult[]> {
	const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
	const normalized = query.trim().toLowerCase().slice(0, 64);
	if (!normalized) {
		return [];
	}

	const cacheKey = getCacheKey('search:fts', limit, normalized);

	const cached = await getCached<SearchResult[]>(cache, cacheKey);
	if (cached) {
		return cached;
	}

	const results = await searchPosts(db, normalized, limit);
	await setCached(cache, cacheKey, results, 120); // short TTL to keep results fresh
	return results;
}
