/**
 * Logout API Endpoint
 *
 * POST /api/auth/logout
 * Invalidates session and clears authentication cookie
 * Always succeeds (idempotent)
 */

import type { RequestHandler } from './$types';
import { extractTokenFromCookie, verifyToken } from '$lib/server/auth/jwt';
import { deleteSession } from '$lib/server/auth/session';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/types';
import { requireEnv } from '$lib/server/env';

function buildClearCookie(secure: boolean): string {
	const parts = [`${SESSION_COOKIE_NAME}=`, 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0'];
	if (secure) {
		parts.push('Secure');
	}
	return parts.join('; ');
}

export const POST: RequestHandler = async (event): Promise<Response> => {
	const { request, url } = event;
	const env = requireEnv(event, ['SESSIONS', 'JWT_SECRET']);

	try {
		// 1. Extract token from cookie
		const cookieHeader = request.headers.get('cookie');
		const token = extractTokenFromCookie(cookieHeader, SESSION_COOKIE_NAME);

		if (token) {
			// 2. Verify token to get user ID (needed for KV key)
			const payload = await verifyToken(token, env.JWT_SECRET);

			if (payload) {
				// 3. Delete session from KV
				await deleteSession(env.SESSIONS, token, payload.sub);
			}
		}

		// 4. Clear cookie (Max-Age=0 deletes it)
		const clearCookieValue = buildClearCookie(url.protocol === 'https:');

		// 5. Always return success (logout is idempotent)
		return new Response(
			JSON.stringify({
				success: true
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': clearCookieValue
				}
			}
		);
	} catch (err) {
		console.error('Logout error:', err);

		// Still succeed and clear cookie even on error
		return new Response(
			JSON.stringify({
				success: true
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': buildClearCookie(url.protocol === 'https:')
				}
			}
		);
	}
};
