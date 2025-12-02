import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const { postId } = params;
	const fingerprint = url.searchParams.get('fingerprint');

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const db = platform.env.DB;

		let userReactions: string[] = [];
		if (fingerprint) {
			const reactions = await db
				.prepare(
					'SELECT reaction_type FROM post_reactions WHERE post_id = ? AND user_fingerprint = ?'
				)
				.bind(postId, fingerprint)
				.all<{ reaction_type: string }>();

			userReactions =
				reactions.results?.map((r: { reaction_type: string }) => r.reaction_type) ?? [];
		}

		return json({ userReactions });
	} catch (error) {
		console.error('Failed to get reactions:', error);
		return json({ error: 'Failed to load reactions' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, platform }) => {
	const { postId } = params;

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const { type, fingerprint } = (await request.json());

		if (!type || !fingerprint) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (!['like', 'heart', 'bookmark'].includes(type)) {
			return json({ error: 'Invalid reaction type' }, { status: 400 });
		}

		const db = platform.env.DB;

		await db
			.prepare(
				'INSERT OR IGNORE INTO post_reactions (post_id, reaction_type, user_fingerprint) VALUES (?, ?, ?)'
			)
			.bind(postId, type, fingerprint)
			.run();

		const countField = `${type}_count`;
		await db
			.prepare(`UPDATE posts SET ${countField} = ${countField} + 1 WHERE id = ?`)
			.bind(postId)
			.run();

		return json({ success: true });
	} catch (error) {
		console.error('Failed to add reaction:', error);
		return json({ error: 'Failed to add reaction' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request, platform }) => {
	const { postId } = params;

	if (!platform?.env?.DB) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	try {
		const { type, fingerprint } = (await request.json());

		if (!type || !fingerprint) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const db = platform.env.DB;

		const result = await db
			.prepare(
				'DELETE FROM post_reactions WHERE post_id = ? AND reaction_type = ? AND user_fingerprint = ?'
			)
			.bind(postId, type, fingerprint)
			.run();

		if (result.success && result.meta.changes > 0) {
			const countField = `${type}_count`;
			await db
				.prepare(
					`UPDATE posts SET ${countField} = CASE WHEN ${countField} > 0 THEN ${countField} - 1 ELSE 0 END WHERE id = ?`
				)
				.bind(postId)
				.run();
		}

		return json({ success: true });
	} catch (error) {
		console.error('Failed to remove reaction:', error);
		return json({ error: 'Failed to remove reaction' }, { status: 500 });
	}
};
