import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Generate a cryptographically secure random token
 */
function generateSecureToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ params, platform, locals }) => {
        if (!locals.user) {
                throw error(401, 'Unauthorized');
        }

        if (!platform?.env?.DB) {
                throw error(500, 'Database not available');
        }

        const postId = params.id;

	try {
		// Generate new preview token
		const previewToken = generateSecureToken();

		// Set expiry to 7 days from now
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		const previewExpiresAt = expiresAt.toISOString();

		// Update post with preview token
		const query = `
			UPDATE posts
			SET preview_token = ?, preview_expires_at = ?
			WHERE id = ?
		`;

		await platform.env.DB.prepare(query).bind(previewToken, previewExpiresAt, postId).run();

		return json({
			preview_token: previewToken,
			preview_expires_at: previewExpiresAt
		});
	} catch (err) {
		console.error('Failed to generate preview token:', err);
		throw error(500, 'Failed to generate preview token');
	}
};
