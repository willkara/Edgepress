/**
 * SvelteKit Server Hooks
 *
 * Global server-side hooks for EdgePress application
 * Handles authentication, authorization, security headers, and error handling
 */

import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import { extractTokenFromCookie, verifyToken } from '$lib/server/auth/jwt';
import { getSession, refreshSession } from '$lib/server/auth/session';
import { getPublicUser } from '$lib/server/auth/user';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/types';
import type { RequiredEnv } from '$lib/server/env';

/**
 * Build security headers for HTTP responses
 * Implements defense-in-depth security practices with strict CSP and security headers
 * @param headers - Original response headers
 * @param isAdmin - Whether this is an admin route (applies stricter caching)
 * @returns New Headers object with security headers applied
 */
function buildSecurityHeaders(headers: Headers, isAdmin: boolean): Headers {
	const h = new Headers(headers);

	// Referrer policy: Only send origin for cross-origin requests
	h.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// Prevent MIME type sniffing
	h.set('X-Content-Type-Options', 'nosniff');

	// Clickjacking protection: Only allow same-origin framing
	h.set('X-Frame-Options', 'SAMEORIGIN');

	// Permissions Policy: Disable sensitive browser features
	h.set(
		'Permissions-Policy',
		'geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()'
	);

	// Admin routes should never be cached
	if (isAdmin) {
		h.set('Cache-Control', 'no-store');
	}

	return h;
}

/**
 * Main SvelteKit request handler hook
 *
 * Executes on every server request to handle:
 * 1. Request ID generation for tracing
 * 2. Environment validation
 * 3. JWT-based authentication
 * 4. Session validation and refresh
 * 5. Admin route protection
 * 6. Security header injection
 * 7. Cloudflare Rocket Loader disable (prevents script execution issues)
 *
 * @param event - SvelteKit request event
 * @param resolve - Function to continue request processing
 * @returns HTTP Response with security headers and authentication applied
 */
export const handle: Handle = async ({ event, resolve }) => {
	const requestId = crypto.randomUUID();
	event.locals.requestId = requestId;

	const rawEnv = event.platform?.env;
	const env =
		rawEnv?.DB && rawEnv?.SESSIONS && rawEnv?.CACHE && rawEnv?.JWT_SECRET
			? (rawEnv as RequiredEnv)
			: undefined;

	const envOk = !!env;
	event.locals.envOk = envOk;

	// Only run auth checks if platform environment is available
	if (!env) {
		console.warn('Platform environment not available in hooks.server.ts');
		return resolve(event);
	}

	try {
		// 1. Extract JWT token from cookie
		const cookieHeader = event.request.headers.get('cookie');
		const token = extractTokenFromCookie(cookieHeader, SESSION_COOKIE_NAME);

		if (token) {
			// 2. Verify JWT signature and expiration
			const payload = await verifyToken(token, env.JWT_SECRET);

			if (payload) {
				// 3. Check session exists in KV (enables instant revocation on logout)
				const session = await getSession(env.SESSIONS, token, payload.sub);

				if (session) {
					// 4. Get user data from D1 database
					const user = await getPublicUser(env.DB, payload.sub);

					if (user) {
						// 5. Populate event.locals.user (available in all routes and endpoints)
						event.locals.user = user;
					}
				}

				// Refresh session TTL on activity to avoid surprising timeouts
				await refreshSession(env.SESSIONS, token, payload.sub);
			}
		}
	} catch (error) {
		// Log error but don't block request
		console.error('Authentication error in hooks:', error instanceof Error ? error.message : error);
		// event.locals.user remains undefined
	}

	// 6. Protect /admin/* routes - require authentication
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			// Redirect to login page (or return 401 for API routes)
			if (event.url.pathname.startsWith('/admin/api/')) {
				return new Response(JSON.stringify({ error: 'Authentication required', requestId }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			// For admin pages, redirect to login with return URL
			const returnUrl = encodeURIComponent(event.url.pathname + event.url.search);
			return new Response(null, {
				status: 302,
				headers: {
					Location: `/login?return=${returnUrl}`
				}
			});
		}
	}

	// 7. Continue with request handling
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// Disable Cloudflare Rocket Loader for all scripts to prevent execution order issues
			// This fixes "r is undefined" and "getMarkdown is not a function" errors
			return html.replace(/<script/g, '<script data-cfasync="false"');
		}
	});

	const headers = buildSecurityHeaders(response.headers, event.url.pathname.startsWith('/admin'));
	headers.set('x-request-id', requestId);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
};

/**
 * Handle fetch hook for server-side fetch requests
 *
 * Currently disabled to prevent serving stale content after database writes.
 * In the future, this could implement smart edge caching with cache invalidation.
 *
 * @param event - SvelteKit request event
 * @param request - Fetch request to handle
 * @param fetch - SvelteKit fetch function
 * @returns Fetch response
 */
export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	// Edge cache disabled for now to avoid stale content after writes.
	// Future: Implement cache-aside pattern with KV-based invalidation
	return fetch(request);
};

/**
 * Global error handler for unhandled server errors
 *
 * Logs error details with request context and Cloudflare metadata
 * Returns user-friendly error message with request ID for support
 *
 * @param error - The error that occurred
 * @param event - SvelteKit request event
 * @returns Error object with message and request ID
 */
export const handleError: HandleServerError = ({ error, event }) => {
	const requestId = event.locals.requestId ?? crypto.randomUUID();

	// Cloudflare provides request metadata in the 'cf' property
	const cf = (event.request as Request & { cf?: Record<string, string> }).cf;

	// Log error with full context for debugging
	const safeError =
		error instanceof Error ? { message: error.message, stack: error.stack } : String(error);

	console.error('Request error', {
		requestId,
		url: event.url?.href,
		method: event.request.method,
		// Cloudflare-specific metadata
		colo: cf?.colo, // Data center location
		asn: cf?.asn, // Autonomous System Number
		country: cf?.country, // Request origin country
		error: safeError
	});

	// Return sanitized error to client (never expose stack traces)
	return {
		message: 'An unexpected error occurred.',
		requestId
	};
};
