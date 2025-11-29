/**
 * Session Check API Endpoint
 *
 * GET /api/auth/session
 * Checks if user is authenticated and returns user data
 * Returns authenticated=false if not logged in
 */

import type { RequestHandler } from './$types';
import { extractTokenFromCookie, verifyToken } from '$lib/server/auth/jwt';
import { getSession } from '$lib/server/auth/session';
import { getPublicUser } from '$lib/server/auth/user';
import type { SessionCheckResult } from '$lib/server/auth/types';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/types';
import { requireEnv } from '$lib/server/env';

export const GET: RequestHandler = async (event): Promise<Response> => {
	const { request } = event;
	const env = requireEnv(event, ['SESSIONS', 'DB', 'JWT_SECRET']);

	try {
		// 1. Extract token from cookie
		const cookieHeader = request.headers.get('cookie');
		const token = extractTokenFromCookie(cookieHeader, SESSION_COOKIE_NAME);

		if (!token) {
			return new Response(
				JSON.stringify({
					authenticated: false
				} as SessionCheckResult),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-store'
					}
				}
			);
		}

		// 2. Verify JWT token (checks signature and expiration)
		const payload = await verifyToken(token, env.JWT_SECRET);

		if (!payload) {
			return new Response(
				JSON.stringify({
					authenticated: false
				} as SessionCheckResult),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-store'
					}
				}
			);
		}

		// 3. Check session exists in KV (enables instant revocation)
		const session = await getSession(env.SESSIONS, token, payload.sub);

		if (!session) {
			return new Response(
				JSON.stringify({
					authenticated: false
				} as SessionCheckResult),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-store'
					}
				}
			);
		}

		// 4. Get user data from D1
		const user = await getPublicUser(env.DB, payload.sub);

		if (!user) {
			return new Response(
				JSON.stringify({
					authenticated: false
				} as SessionCheckResult),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-store'
					}
				}
			);
		}

		// 5. Return authenticated with user data
		return new Response(
			JSON.stringify({
				authenticated: true,
				user
			} as SessionCheckResult),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store' // Never cache authentication state
				}
			}
		);
	} catch (err) {
		console.error('Session check error:', err);

		return new Response(
			JSON.stringify({
				authenticated: false
			} as SessionCheckResult),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store'
				}
			}
		);
	}
};
