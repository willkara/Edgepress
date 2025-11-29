import type { D1Database } from '@cloudflare/workers-types';
import { generateSlug, calculateReadingTime } from '$lib/utils/slug';

export interface AdminPost {
	id: string;
	author_id: string;
	category_id: string | null;
	title: string;
	slug: string;
	content_md: string;
	content_html: string;
	excerpt: string | null;
	hero_image_id: string | null;
	status: 'draft' | 'published';
	published_at: string | null;
	created_at: string;
	updated_at: string;
	reading_time: number | null;
	author_name: string;
	category_name: string | null;
	category_slug: string | null;
}

export interface AdminPostListItem {
	id: string;
	title: string;
	slug: string;
	status: 'draft' | 'published';
	published_at: string | null;
	created_at: string;
	updated_at: string;
	author_name: string;
	category_name: string | null;
}

export interface CreatePostInput {
	author_id: string;
	title: string;
	slug?: string;
	content_md: string;
	content_html: string;
	excerpt?: string | null;
	hero_image_id?: string | null;
	category_id?: string | null;
	status?: 'draft' | 'published';
	published_at?: string | null;
}

export interface UpdatePostInput {
	title?: string;
	slug?: string;
	content_md?: string;
	content_html?: string;
	excerpt?: string | null;
	hero_image_id?: string | null;
	category_id?: string | null;
	status?: 'draft' | 'published';
	published_at?: string | null;
}

export interface PostListFilters {
	status?: 'draft' | 'published' | 'all';
	search?: string;
	category_id?: string;
	author_id?: string;
	limit?: number;
	offset?: number;
}

/**
 * Create a new post
 */
export async function createPost(db: D1Database, input: CreatePostInput): Promise<AdminPost> {
	const slug = input.slug || generateSlug(input.title);
	const readingTime = calculateReadingTime(input.content_md);
	const status = input.status || 'draft';
	const now = new Date().toISOString();

	// If publishing, set published_at if not provided
	const publishedAt =
		status === 'published' ? input.published_at || now : input.published_at || null;

	const insertQuery = `
		INSERT INTO posts (
			author_id, category_id, title, slug, content_md, content_html,
			excerpt, hero_image_id, status, published_at, reading_time,
			created_at, updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id
	`;

	const result = await db
		.prepare(insertQuery)
		.bind(
			input.author_id,
			input.category_id || null,
			input.title,
			slug,
			input.content_md,
			input.content_html,
			input.excerpt || null,
			input.hero_image_id || null,
			status,
			publishedAt,
			readingTime,
			now,
			now
		)
		.first<{ id: string }>();

	if (!result?.id) {
		throw new Error('Failed to create post');
	}

	const post = await getPostById(db, result.id);
	if (!post) {
		throw new Error('Failed to retrieve created post');
	}

	return post;
}

/**
 * Get a post by ID (includes drafts)
 */
export async function getPostById(db: D1Database, id: string): Promise<AdminPost | null> {
	const query = `
		SELECT
			p.*,
			u.display_name as author_name,
			c.name as category_name,
			c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(id).first<AdminPost>();
	return result || null;
}

/**
 * Get a post by slug (includes drafts)
 */
export async function getPostBySlug(db: D1Database, slug: string): Promise<AdminPost | null> {
	const query = `
		SELECT
			p.*,
			u.display_name as author_name,
			c.name as category_name,
			c.slug as category_slug
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.slug = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(slug).first<AdminPost>();
	return result || null;
}

/**
 * Update a post
 */
export async function updatePost(
	db: D1Database,
	id: string,
	input: UpdatePostInput
): Promise<AdminPost> {
	const updates: string[] = [];
	const bindings: any[] = [];

	if (input.title !== undefined) {
		updates.push('title = ?');
		bindings.push(input.title);
	}

	if (input.slug !== undefined) {
		updates.push('slug = ?');
		bindings.push(input.slug);
	}

	if (input.content_md !== undefined) {
		updates.push('content_md = ?');
		bindings.push(input.content_md);

		// Recalculate reading time when content changes
		const readingTime = calculateReadingTime(input.content_md);
		updates.push('reading_time = ?');
		bindings.push(readingTime);
	}

	if (input.content_html !== undefined) {
		updates.push('content_html = ?');
		bindings.push(input.content_html);
	}

	if (input.excerpt !== undefined) {
		updates.push('excerpt = ?');
		bindings.push(input.excerpt);
	}

	if (input.hero_image_id !== undefined) {
		updates.push('hero_image_id = ?');
		bindings.push(input.hero_image_id);
	}

	if (input.category_id !== undefined) {
		updates.push('category_id = ?');
		bindings.push(input.category_id);
	}

	if (input.status !== undefined) {
		updates.push('status = ?');
		bindings.push(input.status);

		// If status changed to published and no published_at, set it now
		if (input.status === 'published' && input.published_at === undefined) {
			updates.push('published_at = ?');
			bindings.push(new Date().toISOString());
		}
	}

	if (input.published_at !== undefined) {
		updates.push('published_at = ?');
		bindings.push(input.published_at);
	}

	// Always update updated_at
	updates.push('updated_at = ?');
	bindings.push(new Date().toISOString());

	if (updates.length === 1) {
		// Only updated_at was changed, nothing else to do
		const post = await getPostById(db, id);
		if (!post) {
			throw new Error('Post not found');
		}
		return post;
	}

	bindings.push(id);

	const updateQuery = `
		UPDATE posts
		SET ${updates.join(', ')}
		WHERE id = ?
	`;

	await db
		.prepare(updateQuery)
		.bind(...bindings)
		.run();

	const post = await getPostById(db, id);
	if (!post) {
		throw new Error('Post not found');
	}

	return post;
}

/**
 * Delete a post
 */
export async function deletePost(db: D1Database, id: string): Promise<void> {
	await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
}

/**
 * List posts with filters and pagination
 */
export async function listPosts(
	db: D1Database,
	filters: PostListFilters = {}
): Promise<{ posts: AdminPostListItem[]; total: number }> {
	const limit = filters.limit || 20;
	const offset = filters.offset || 0;

	const conditions: string[] = [];
	const bindings: any[] = [];

	// Status filter
	if (filters.status && filters.status !== 'all') {
		conditions.push('p.status = ?');
		bindings.push(filters.status);
	}

	// Search filter (title or content)
	if (filters.search) {
		conditions.push('(p.title LIKE ? OR p.content_md LIKE ?)');
		const searchPattern = `%${filters.search}%`;
		bindings.push(searchPattern, searchPattern);
	}

	// Category filter
	if (filters.category_id) {
		conditions.push('p.category_id = ?');
		bindings.push(filters.category_id);
	}

	// Author filter
	if (filters.author_id) {
		conditions.push('p.author_id = ?');
		bindings.push(filters.author_id);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	// Get total count
	const countQuery = `
		SELECT COUNT(*) as count
		FROM posts p
		${whereClause}
	`;

	const countResult = await db
		.prepare(countQuery)
		.bind(...bindings)
		.first<{ count: number }>();
	const total = countResult?.count || 0;

	// Get posts
	const postsQuery = `
		SELECT
			p.id, p.title, p.slug, p.status, p.published_at, p.created_at, p.updated_at,
			u.display_name as author_name,
			c.name as category_name
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN categories c ON p.category_id = c.id
		${whereClause}
		ORDER BY p.updated_at DESC
		LIMIT ? OFFSET ?
	`;

	const postsResult = await db
		.prepare(postsQuery)
		.bind(...bindings, limit, offset)
		.all<AdminPostListItem>();

	return {
		posts: postsResult.results || [],
		total
	};
}

/**
 * Publish a post
 */
export async function publishPost(db: D1Database, id: string): Promise<AdminPost> {
	return updatePost(db, id, {
		status: 'published',
		published_at: new Date().toISOString()
	});
}

/**
 * Unpublish a post (set to draft)
 */
export async function unpublishPost(db: D1Database, id: string): Promise<AdminPost> {
	return updatePost(db, id, {
		status: 'draft',
		published_at: null
	});
}

/**
 * Get all tags for a post
 */
export async function getPostTags(
	db: D1Database,
	postId: string
): Promise<{ id: string; name: string; slug: string }[]> {
	const query = `
		SELECT t.id, t.name, t.slug
		FROM tags t
		INNER JOIN post_tags pt ON t.id = pt.tag_id
		WHERE pt.post_id = ?
		ORDER BY t.name ASC
	`;

	const result = await db
		.prepare(query)
		.bind(postId)
		.all<{ id: string; name: string; slug: string }>();
	return result.results || [];
}

/**
 * Update post tags (replaces all existing tags)
 */
export async function updatePostTags(
	db: D1Database,
	postId: string,
	tagIds: string[]
): Promise<void> {
	// Delete existing tags
	await db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId).run();

	// Insert new tags
	if (tagIds.length > 0) {
		const values = tagIds.map(() => '(?, ?)').join(', ');
		const insertQuery = `INSERT INTO post_tags (post_id, tag_id) VALUES ${values}`;

		const bindings: any[] = [];
		for (const tagId of tagIds) {
			bindings.push(postId, tagId);
		}

		await db
			.prepare(insertQuery)
			.bind(...bindings)
			.run();
	}
}

/**
 * Check if a slug is available (not used by another post)
 */
export async function isSlugAvailable(
	db: D1Database,
	slug: string,
	excludePostId?: string
): Promise<boolean> {
	let query = 'SELECT COUNT(*) as count FROM posts WHERE slug = ?';
	const bindings: any[] = [slug];

	if (excludePostId) {
		query += ' AND id != ?';
		bindings.push(excludePostId);
	}

	const result = await db
		.prepare(query)
		.bind(...bindings)
		.first<{ count: number }>();
	return (result?.count || 0) === 0;
}
