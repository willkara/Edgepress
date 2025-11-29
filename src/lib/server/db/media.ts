import type { D1Database } from '@cloudflare/workers-types';
import type { QueryBindingValue } from './logger';

export interface Media {
	id: string;
	cf_image_id: string;
	filename: string;
	alt_text: string | null;
	uploaded_by: string;
	width: number | null;
	height: number | null;
	file_size: number | null;
	mime_type: string | null;
	usage_count: number;
	created_at: string;
}

export interface MediaWithUsage extends Media {
	posts?: Array<{
		id: string;
		title: string;
		usage_type: 'hero' | 'content';
	}>;
}

/**
 * Parse HTML content to extract media IDs from data-media-id attributes
 */
export function extractMediaIdsFromHTML(html: string): string[] {
	const mediaIds: string[] = [];
	const regex = /data-media-id="([^"]+)"/g;
	let match;

	while ((match = regex.exec(html)) !== null) {
		mediaIds.push(match[1]);
	}

	return [...new Set(mediaIds)]; // Deduplicate
}

/**
 * Sync post-media relationships when a post is saved
 * Tracks both hero images and images embedded in content
 */
export async function syncPostMedia(
	db: D1Database,
	postId: string,
	contentHtml: string,
	heroImageId: string | null
): Promise<void> {
	// Extract media IDs from content
	const contentMediaIds = extractMediaIdsFromHTML(contentHtml);

	// Delete existing content relationships
	await db
		.prepare('DELETE FROM post_media WHERE post_id = ? AND usage_type = ?')
		.bind(postId, 'content')
		.run();

	// Insert new content relationships
	for (const mediaId of contentMediaIds) {
		await db
			.prepare(
				`INSERT INTO post_media (post_id, media_id, usage_type)
				VALUES (?, ?, 'content')
				ON CONFLICT DO NOTHING`
			)
			.bind(postId, mediaId)
			.run();
	}

	// Handle hero image
	await db
		.prepare('DELETE FROM post_media WHERE post_id = ? AND usage_type = ?')
		.bind(postId, 'hero')
		.run();

	if (heroImageId) {
		await db
			.prepare(
				`INSERT INTO post_media (post_id, media_id, usage_type)
				VALUES (?, ?, 'hero')
				ON CONFLICT DO NOTHING`
			)
			.bind(postId, heroImageId)
			.run();
	}

	// Update usage counts for all affected media
	const allMediaIds = [...new Set([...contentMediaIds, ...(heroImageId ? [heroImageId] : [])])];

	for (const mediaId of allMediaIds) {
		await db
			.prepare(
				`UPDATE media
				SET usage_count = (
					SELECT COUNT(DISTINCT post_id)
					FROM post_media
					WHERE post_media.media_id = ?
				)
				WHERE id = ?`
			)
			.bind(mediaId, mediaId)
			.run();
	}
}

/**
 * Get a single media item by ID
 */
export async function getMediaById(db: D1Database, id: string): Promise<Media | null> {
	const result = await db.prepare(`SELECT * FROM media WHERE id = ?`).bind(id).first<Media>();

	return result || null;
}

/**
 * List all media with optional filtering
 * Optimized to use a single query instead of N+1 queries
 */
export async function listMedia(
	db: D1Database,
	options: {
		filter?: 'all' | 'used' | 'orphaned';
		limit?: number;
		offset?: number;
	} = {}
): Promise<MediaWithUsage[]> {
	const { filter = 'all', limit = 50, offset = 0 } = options;

	// Build a single query that fetches media with aggregated post usage data
	let query = `
		SELECT
			m.*,
			COALESCE(
				json_group_array(
					CASE
						WHEN p.id IS NOT NULL
						THEN json_object(
							'id', p.id,
							'title', p.title,
							'usage_type', pm.usage_type
						)
						ELSE NULL
					END
				) FILTER (WHERE p.id IS NOT NULL),
				'[]'
			) as posts_json
		FROM media m
	`;

	// Apply filters
	if (filter === 'orphaned') {
		query += `
			LEFT JOIN post_media pm ON m.id = pm.media_id
			LEFT JOIN posts p ON pm.post_id = p.id
		`;
	} else if (filter === 'used') {
		query += `
			INNER JOIN post_media pm ON m.id = pm.media_id
			LEFT JOIN posts p ON pm.post_id = p.id
		`;
	} else {
		// 'all' - include all media with optional post relationships
		query += `
			LEFT JOIN post_media pm ON m.id = pm.media_id
			LEFT JOIN posts p ON pm.post_id = p.id
		`;
	}

	// Add WHERE clause for orphaned filter
	if (filter === 'orphaned') {
		query += `
			WHERE pm.media_id IS NULL
		`;
	}

	// Group by media to aggregate posts, then order and paginate
	query += `
		GROUP BY m.id
		ORDER BY m.created_at DESC
		LIMIT ? OFFSET ?
	`;

	const result = await db.prepare(query).bind(limit, offset).all<Media & { posts_json: string }>();

	if (!result.results) {
		return [];
	}

	// Parse the aggregated JSON data
	return result.results.map((row) => {
		const { posts_json, ...media } = row;
		let posts: Array<{ id: string; title: string; usage_type: 'hero' | 'content' }> = [];

		try {
			const parsed = JSON.parse(posts_json);
			// Filter out null entries and sort by title
			posts = parsed
				.filter((p: any) => p !== null)
				.sort((a: any, b: any) => a.title.localeCompare(b.title));
		} catch (e) {
			console.error('Failed to parse posts_json:', e);
		}

		return {
			...media,
			posts
		};
	});
}

/**
 * Get media usage details for a specific media item
 */
export async function getMediaUsage(
	db: D1Database,
	mediaId: string
): Promise<Array<{ id: string; title: string; usage_type: 'hero' | 'content' }>> {
	const result = await db
		.prepare(
			`SELECT
				p.id,
				p.title,
				pm.usage_type
			FROM post_media pm
			JOIN posts p ON pm.post_id = p.id
			WHERE pm.media_id = ?
			ORDER BY p.title`
		)
		.bind(mediaId)
		.all<{ id: string; title: string; usage_type: 'hero' | 'content' }>();

	return result.results || [];
}

/**
 * Update media metadata
 */
export async function updateMedia(
	db: D1Database,
	id: string,
	data: {
		alt_text?: string;
		filename?: string;
	}
): Promise<Media | null> {
	const updates: string[] = [];
	const values: QueryBindingValue[] = [];

	if (data.alt_text !== undefined) {
		updates.push('alt_text = ?');
		values.push(data.alt_text);
	}

	if (data.filename !== undefined) {
		updates.push('filename = ?');
		values.push(data.filename);
	}

	if (updates.length === 0) {
		return getMediaById(db, id);
	}

	values.push(id);

	await db
		.prepare(
			`UPDATE media
			SET ${updates.join(', ')}
			WHERE id = ?`
		)
		.bind(...values)
		.run();

	return getMediaById(db, id);
}

/**
 * Delete media (only if orphaned - usage_count = 0)
 * Also deletes from Cloudflare Images
 */
export async function deleteMedia(
	db: D1Database,
	mediaId: string,
	cfAccountId: string,
	cfToken: string
): Promise<{ success: boolean; message: string }> {
	// Check if media is orphaned
	const media = await getMediaById(db, mediaId);

	if (!media) {
		return { success: false, message: 'Media not found' };
	}

	if (media.usage_count > 0) {
		return {
			success: false,
			message: `Cannot delete: image is used in ${media.usage_count} post(s)`
		};
	}

	// Delete from Cloudflare Images
	try {
		const cfResponse = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${media.cf_image_id}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${cfToken}`
				}
			}
		);

		if (!cfResponse.ok) {
			console.error('Failed to delete from Cloudflare Images:', await cfResponse.text());
			// Continue with database deletion even if CF deletion fails
		}
	} catch (err) {
		console.error('Error deleting from Cloudflare Images:', err);
		// Continue with database deletion
	}

	// Delete from database
	await db.prepare('DELETE FROM media WHERE id = ?').bind(mediaId).run();

	return { success: true, message: 'Media deleted successfully' };
}

/**
 * Create a new media record
 */
export async function createMedia(
	db: D1Database,
	data: {
		id: string;
		cf_image_id: string;
		filename: string;
		uploaded_by: string;
		width?: number | null;
		height?: number | null;
		file_size?: number | null;
		mime_type?: string | null;
		alt_text?: string | null;
	}
): Promise<Media> {
	await db
		.prepare(
			`INSERT INTO media (
				id, cf_image_id, filename, uploaded_by,
				width, height, file_size, mime_type, alt_text,
				created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			data.id,
			data.cf_image_id,
			data.filename,
			data.uploaded_by,
			data.width || null,
			data.height || null,
			data.file_size || null,
			data.mime_type || null,
			data.alt_text || null,
			new Date().toISOString()
		)
		.run();

	const media = await getMediaById(db, data.id);

	if (!media) {
		throw new Error('Failed to create media record');
	}

	return media;
}
