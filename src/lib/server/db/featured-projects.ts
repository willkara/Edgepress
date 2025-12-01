import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface FeaturedProject {
	id: string;
	post_id: string;
	display_order: number;
	custom_description: string | null;
	is_featured: number;
	created_at: string;
	updated_at: string;
}

export interface FeaturedProjectWithPost {
	id: string;
	post_id: string;
	display_order: number;
	custom_description: string | null;
	is_featured: number;
	// Post fields
	post_title: string;
	post_slug: string;
	post_excerpt: string | null;
	post_hero_image_id: string | null;
	post_published_at: string;
	category_name: string | null;
	tags: string[]; // Array of tag names
}

/**
 * Cache key identifier for featured project queries
 */
const FEATURED_PROJECTS_CACHE_KEY = 'featured-projects';

/**
 * Get all featured projects with their post details, ordered by display_order
 */
export async function getFeaturedProjects(
        db: D1Database,
        includeUnfeatured = false
): Promise<FeaturedProjectWithPost[]> {
	const whereClause = includeUnfeatured ? '' : 'WHERE fp.is_featured = 1';

	const query = `
		SELECT
			fp.id,
			fp.post_id,
			fp.display_order,
			fp.custom_description,
			fp.is_featured,
			p.title as post_title,
			p.slug as post_slug,
			p.excerpt as post_excerpt,
			p.hero_image_id as post_hero_image_id,
			p.published_at as post_published_at,
			c.name as category_name
		FROM featured_projects fp
		INNER JOIN posts p ON fp.post_id = p.id
		LEFT JOIN categories c ON p.category_id = c.id
		${whereClause}
		ORDER BY fp.display_order ASC
	`;

	const result = await db.prepare(query).all<Omit<FeaturedProjectWithPost, 'tags'>>();
	const projects = result.results || [];

	// Fetch tags for each project
	const projectsWithTags = await Promise.all(
		projects.map(async (project) => {
			const tagsQuery = `
				SELECT t.name
				FROM tags t
				INNER JOIN post_tags pt ON t.id = pt.tag_id
				WHERE pt.post_id = ?
				ORDER BY t.name
			`;
			const tagsResult = await db.prepare(tagsQuery).bind(project.post_id).all<{ name: string }>();
			const tags = (tagsResult.results || []).map((t) => t.name);

			return {
				...project,
				tags
			};
		})
	);

        return projectsWithTags;
}

/**
 * Get featured projects with KV caching to reduce D1 reads on public pages
 */
export async function getFeaturedProjectsCached(
        db: D1Database,
        cache: KVNamespace,
        includeUnfeatured = false
): Promise<FeaturedProjectWithPost[]> {
        const { getCached, setCached, getCacheKey } = await import('$lib/server/cache/cache');
        const cacheKey = getCacheKey(
                FEATURED_PROJECTS_CACHE_KEY,
                includeUnfeatured ? 'all' : 'featured'
        );

        const cached = await getCached<FeaturedProjectWithPost[]>(cache, cacheKey, { tag: 'featured_projects' });
        if (cached) {
                return cached;
        }

        const projects = await getFeaturedProjects(db, includeUnfeatured);
        await setCached(cache, cacheKey, projects, { ttl: 600, tag: 'featured_projects' });

        return projects;
}

/**
 * Add a post to featured projects
 */
export async function addFeaturedProject(
	db: D1Database,
	postId: string,
	displayOrder: number,
	customDescription?: string
): Promise<void> {
	const query = `
		INSERT INTO featured_projects (post_id, display_order, custom_description, is_featured)
		VALUES (?, ?, ?, 1)
	`;

	await db.prepare(query).bind(postId, displayOrder, customDescription || null).run();
}

/**
 * Remove a post from featured projects
 */
export async function removeFeaturedProject(db: D1Database, id: string): Promise<void> {
	const query = 'DELETE FROM featured_projects WHERE id = ?';
	await db.prepare(query).bind(id).run();
}

/**
 * Toggle featured status
 */
export async function toggleFeaturedStatus(db: D1Database, id: string): Promise<void> {
	const query = `
		UPDATE featured_projects
		SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END,
		    updated_at = datetime('now')
		WHERE id = ?
	`;
	await db.prepare(query).bind(id).run();
}

/**
 * Update display order for a featured project
 */
export async function updateDisplayOrder(
	db: D1Database,
	id: string,
	newOrder: number
): Promise<void> {
	const query = `
		UPDATE featured_projects
		SET display_order = ?,
		    updated_at = datetime('now')
		WHERE id = ?
	`;
	await db.prepare(query).bind(newOrder, id).run();
}

/**
 * Update custom description
 */
export async function updateCustomDescription(
	db: D1Database,
	id: string,
	description: string | null
): Promise<void> {
	const query = `
		UPDATE featured_projects
		SET custom_description = ?,
		    updated_at = datetime('now')
		WHERE id = ?
	`;
	await db.prepare(query).bind(description, id).run();
}

/**
 * Batch update display orders (for drag-and-drop reordering)
 */
export async function batchUpdateDisplayOrders(
	db: D1Database,
	updates: { id: string; display_order: number }[]
): Promise<void> {
	const statements = updates.map(({ id, display_order }) => {
		return db
			.prepare(
				`UPDATE featured_projects
				 SET display_order = ?,
				     updated_at = datetime('now')
				 WHERE id = ?`
			)
			.bind(display_order, id);
	});

	await db.batch(statements);
}

/**
 * Check if a post is already featured
 */
export async function isPostFeatured(db: D1Database, postId: string): Promise<boolean> {
	const query = 'SELECT id FROM featured_projects WHERE post_id = ? LIMIT 1';
	const result = await db.prepare(query).bind(postId).first();
	return !!result;
}

/**
 * Get all posts in "Projects" category that are not yet featured
 */
export async function getUnfeaturedProjectPosts(db: D1Database): Promise<
	Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		published_at: string;
	}>
> {
	const query = `
		SELECT
			p.id,
			p.title,
			p.slug,
			p.excerpt,
			p.published_at
		FROM posts p
		INNER JOIN categories c ON p.category_id = c.id
		WHERE c.slug = 'projects'
		  AND p.status = 'published'
		  AND p.id NOT IN (SELECT post_id FROM featured_projects)
		ORDER BY p.published_at DESC
	`;

	const result = await db.prepare(query).all<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		published_at: string;
	}>();

	return result.results || [];
}
