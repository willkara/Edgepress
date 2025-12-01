import type { D1Database } from '@cloudflare/workers-types';

export interface Project {
	id: string;
	title: string;
	slug: string;
	summary: string | null;
	tech_stack: string[];
	repo_url: string | null;
	live_url: string | null;
	hero_image_id: string | null;
	status: string;
	display_order: number;
	created_at: string;
	updated_at: string;
	tags?: string[];
}

function parseTechStack(rawValue: string | null): string[] {
	if (!rawValue) {
		return [];
	}

	try {
		const parsed = JSON.parse(rawValue);

		if (Array.isArray(parsed)) {
			return parsed.map((value) => String(value));
		}
	} catch (error) {
		console.warn('Failed to parse tech_stack column, returning empty array', error);
	}

	return rawValue
		.split(',')
		.map((value) => value.trim())
		.filter((value) => value.length > 0);
}

function mapProjectRow(row: any): Project {
	return {
		...row,
		summary: row.summary ?? null,
		repo_url: row.repo_url ?? null,
		live_url: row.live_url ?? null,
		hero_image_id: row.hero_image_id ?? null,
		tech_stack: parseTechStack(row.tech_stack),
		tags: row.tags ? row.tags.split(',') : undefined
	};
}

export async function getProjects(db: D1Database, includeDrafts = false): Promise<Project[]> {
	const whereClause = includeDrafts ? '' : "WHERE status != 'draft'";

	const query = `
                SELECT
                        p.id,
                        p.title,
                        p.slug,
                        p.summary,
                        p.tech_stack,
                        p.repo_url,
                        p.live_url,
                        p.hero_image_id,
                        p.status,
                        p.display_order,
                        p.created_at,
                        p.updated_at
                FROM projects p
                ${whereClause}
                ORDER BY p.display_order ASC, p.created_at DESC
        `;

	const result = await db.prepare(query).all<Project>();
	const projects = result.results || [];

	return projects.map((project) => mapProjectRow(project));
}

export async function getProjectBySlug(
	db: D1Database,
	slug: string,
	includeDrafts = false
): Promise<Project | null> {
	const whereClause = includeDrafts ? '' : "AND p.status != 'draft'";

	const query = `
                SELECT
                        p.id,
                        p.title,
                        p.slug,
                        p.summary,
                        p.tech_stack,
                        p.repo_url,
                        p.live_url,
                        p.hero_image_id,
                        p.status,
                        p.display_order,
                        p.created_at,
                        p.updated_at
                FROM projects p
                WHERE p.slug = ?
                ${whereClause}
                LIMIT 1
        `;

	const project = await db.prepare(query).bind(slug).first<Project>();

	return project ? mapProjectRow(project) : null;
}

export async function getFeaturedProjects(db: D1Database): Promise<Project[]> {
	const query = `
                SELECT
                        p.id,
                        p.title,
                        p.slug,
                        p.summary,
                        p.tech_stack,
                        p.repo_url,
                        p.live_url,
                        p.hero_image_id,
                        p.status,
                        p.display_order,
                        p.created_at,
                        p.updated_at
                FROM projects p
                WHERE p.status = 'featured'
                ORDER BY p.display_order ASC, p.created_at DESC
        `;

	const result = await db.prepare(query).all<Project>();
	const projects = result.results || [];

	return projects.map((project) => mapProjectRow(project));
}

export async function updateProjectDisplayOrder(
	db: D1Database,
	projectId: string,
	displayOrder: number
): Promise<void> {
	const query = `
                UPDATE projects
                SET display_order = ?,
                    updated_at = datetime('now')
                WHERE id = ?
        `;

	await db.prepare(query).bind(displayOrder, projectId).run();
}

export async function setProjectStatus(
	db: D1Database,
	projectId: string,
	status: string
): Promise<void> {
	const query = `
                UPDATE projects
                SET status = ?,
                    updated_at = datetime('now')
                WHERE id = ?
        `;

	await db.prepare(query).bind(status, projectId).run();
}
