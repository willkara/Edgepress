import type { D1Database } from '@cloudflare/workers-types';

export interface Project {
	id: string;
	slug: string;
	title: string;
	description: string;
	content_md: string | null;
	hero_image_id: string | null;
	repo_url: string | null;
	demo_url: string | null;
	tech_stack: string[]; // Parsed from JSON
	is_featured: boolean;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export type NewProject = Omit<Project, 'id' | 'created_at' | 'updated_at'>;

/**
 * Helper to parse project from DB result (handling JSON fields and boolean conversions)
 */
function parseProject(row: any): Project {
	return {
		...row,
		is_featured: row.is_featured === 1,
		tech_stack: row.tech_stack ? JSON.parse(row.tech_stack) : []
	};
}

/**
 * Get all projects, optionally filtering by featured status
 */
export async function getAllProjects(
	db: D1Database,
	onlyFeatured = false
): Promise<Project[]> {
	let query = `
		SELECT * FROM projects
		${onlyFeatured ? 'WHERE is_featured = 1' : ''}
		ORDER BY display_order ASC, created_at DESC
	`;

	const result = await db.prepare(query).all();
	return (result.results || []).map(parseProject);
}

/**
 * Get a single project by ID
 */
export async function getProjectById(db: D1Database, id: string): Promise<Project | null> {
	const query = 'SELECT * FROM projects WHERE id = ?';
	const result = await db.prepare(query).bind(id).first();
	return result ? parseProject(result) : null;
}

/**
 * Get a single project by Slug
 */
export async function getProjectBySlug(db: D1Database, slug: string): Promise<Project | null> {
	const query = 'SELECT * FROM projects WHERE slug = ?';
	const result = await db.prepare(query).bind(slug).first();
	return result ? parseProject(result) : null;
}

/**
 * Create a new project
 */
export async function createProject(db: D1Database, project: NewProject): Promise<string> {
	const id = crypto.randomUUID();
	const query = `
		INSERT INTO projects (
			id, slug, title, description, content_md, hero_image_id,
			repo_url, demo_url, tech_stack, is_featured, display_order
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	await db.prepare(query).bind(
		id,
		project.slug,
		project.title,
		project.description,
		project.content_md || null,
		project.hero_image_id || null,
		project.repo_url || null,
		project.demo_url || null,
		JSON.stringify(project.tech_stack || []),
		project.is_featured ? 1 : 0,
		project.display_order
	).run();

	return id;
}

/**
 * Update an existing project
 */
export async function updateProject(db: D1Database, id: string, project: Partial<NewProject>): Promise<void> {
	// Dynamically build the UPDATE query based on provided fields
	const fields: string[] = [];
	const values: any[] = [];

	if (project.slug !== undefined) { fields.push('slug = ?'); values.push(project.slug); }
	if (project.title !== undefined) { fields.push('title = ?'); values.push(project.title); }
	if (project.description !== undefined) { fields.push('description = ?'); values.push(project.description); }
	if (project.content_md !== undefined) { fields.push('content_md = ?'); values.push(project.content_md); }
	if (project.hero_image_id !== undefined) { fields.push('hero_image_id = ?'); values.push(project.hero_image_id); }
	if (project.repo_url !== undefined) { fields.push('repo_url = ?'); values.push(project.repo_url); }
	if (project.demo_url !== undefined) { fields.push('demo_url = ?'); values.push(project.demo_url); }
	if (project.tech_stack !== undefined) { fields.push('tech_stack = ?'); values.push(JSON.stringify(project.tech_stack)); }
	if (project.is_featured !== undefined) { fields.push('is_featured = ?'); values.push(project.is_featured ? 1 : 0); }
	if (project.display_order !== undefined) { fields.push('display_order = ?'); values.push(project.display_order); }

	if (fields.length === 0) return;

	fields.push("updated_at = datetime('now')");
	values.push(id);

	const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
	await db.prepare(query).bind(...values).run();
}

/**
 * Delete a project
 */
export async function deleteProject(db: D1Database, id: string): Promise<void> {
	await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
}

/**
 * Reorder projects (batch update)
 */
export async function reorderProjects(
	db: D1Database,
	updates: { id: string; display_order: number }[]
): Promise<void> {
	const statements = updates.map(({ id, display_order }) => {
		return db.prepare(
			"UPDATE projects SET display_order = ?, updated_at = datetime('now') WHERE id = ?"
		).bind(display_order, id);
	});

	await db.batch(statements);
}
