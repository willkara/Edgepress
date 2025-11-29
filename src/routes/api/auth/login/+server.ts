/**
 * Login API Endpoint
 *
 * POST /api/auth/login
 * Authenticates user with email and password, returns JWT token in HTTP-only cookie
 */

import type { RequestHandler } from './$types';
import type { KVNamespace } from '@cloudflare/workers-types';
import { getUserByEmail } from '$lib/server/auth/user';
import { verifyPassword } from '$lib/server/auth/password';
import { generateToken } from '$lib/server/auth/jwt';
import { createSession } from '$lib/server/auth/session';
import type { LoginCredentials, LoginResult } from '$lib/server/auth/types';
import { SESSION_COOKIE_NAME, SESSION_TTL } from '$lib/server/auth/types';
import { requireEnv } from '$lib/server/env';

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_TTL_SECONDS = 600;

function getClientIp(request: Request): string {
	const cfConnectingIp = request.headers.get('cf-connecting-ip');
	if (cfConnectingIp) {
		return cfConnectingIp;
	}

	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
	}

	return 'local';
}

function buildSessionCookie(token: string, secure: boolean): string {
	const parts = [
		`${SESSION_COOKIE_NAME}=${token}`,
		'HttpOnly',
		'SameSite=Lax',
		'Path=/',
		`Max-Age=${SESSION_TTL}`
	];

	if (secure) {
		parts.push('Secure');
	}

	return parts.join('; ');
}

async function isRateLimited(kv: KVNamespace, key: string): Promise<boolean> {
	const value = await kv.get(key, 'text');
	const count = value ? parseInt(value, 10) : 0;
	return count >= RATE_LIMIT_ATTEMPTS;
}

async function recordFailure(kv: KVNamespace, key: string): Promise<void> {
	const value = await kv.get(key, 'text');
	const count = value ? parseInt(value, 10) : 0;
	await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_TTL_SECONDS });
}

export const POST: RequestHandler = async (event): Promise<Response> => {
	const { request, url } = event;
	const env = requireEnv(event, ['DB', 'CACHE', 'SESSIONS', 'JWT_SECRET']);

	const kv = env.CACHE;
	const clientIp = getClientIp(request);

	try {
		// Parse request body
		const body: LoginCredentials = await request.json();
		const { email, password } = body;

		// Validate required fields
		if (!email || !password) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Email and password are required'
				} as LoginResult),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Basic email format validation
		if (!email.includes('@') || email.length < 3) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid email format'
				} as LoginResult),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Rate limit check (best effort)
		if (kv) {
			const ipKey = `rate:login:ip:${clientIp}`;
			const emailKey = `rate:login:email:${email.toLowerCase()}`;

			if ((await isRateLimited(kv, ipKey)) || (await isRateLimited(kv, emailKey))) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Too many login attempts. Please try again in a few minutes.'
					} as LoginResult),
					{
						status: 429,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
		}

		// 1. Look up user by email
		const user = await getUserByEmail(env.DB, email);

		if (!user) {
			if (kv) {
				await recordFailure(kv, `rate:login:ip:${clientIp}`);
				await recordFailure(kv, `rate:login:email:${email.toLowerCase()}`);
			}

			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid email or password'
				} as LoginResult),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// 2. Verify password against hash
		const passwordValid = await verifyPassword(password, user.password_hash);

		if (!passwordValid) {
			if (kv) {
				await recordFailure(kv, `rate:login:ip:${clientIp}`);
				await recordFailure(kv, `rate:login:email:${email.toLowerCase()}`);
			}

			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid email or password'
				} as LoginResult),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// 3. Generate JWT token
		const token = await generateToken(
			{
				sub: user.id,
				email: user.email,
				display_name: user.display_name
			},
			env.JWT_SECRET
		);

		// 4. Store session in KV
		const userAgent = request.headers.get('user-agent') || undefined;
		await createSession(env.SESSIONS, token, user.id, SESSION_TTL, userAgent);

		// 5. Set HTTP-only cookie with security flags (Secure only on HTTPS)
		const cookieValue = buildSessionCookie(token, url.protocol === 'https:');

		// 6. Return success with public user data
		return new Response(
			JSON.stringify({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					display_name: user.display_name
				}
			} as LoginResult),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': cookieValue
				}
			}
		);
	} catch (err) {
		console.error('Login error:', err);

		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error'
			} as LoginResult),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
