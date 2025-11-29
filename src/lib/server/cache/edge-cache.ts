/**
 * Edge cache utilities backed by Cloudflare Cache API
 *
 * Use this for short-lived caching of unauthenticated GET responses.
 * Pair with KV for longer TTL/layered caching if needed.
 */

/**
 * Options for edge caching operations
 */
export interface EdgeCacheOptions {
	/** Time to live in seconds (default: 300 = 5 minutes) */
	ttl?: number;
	/** Cache instance to use (defaults to platform.caches.default) */
	cache?: Cache;
}

/**
 * Build a cache key from a Request
 * Returns null for non-cacheable requests (non-GET or authenticated)
 * @param request - The incoming request
 * @returns The request to use as cache key, or null if not cacheable
 */
export function buildEdgeCacheKey(request: Request): Request | null {
	if (request.method !== 'GET') {
		return null;
	}
	if (request.headers.has('cookie')) {
		return null;
	}
	return request;
}

/**
 * Retrieve a cached response from Cloudflare edge cache
 * @param request - The incoming request to lookup
 * @param cache - Cache instance to query
 * @returns Promise resolving to the cached response or null if not found
 */
export async function getEdgeCached(request: Request, cache: Cache): Promise<Response | null> {
	const key = buildEdgeCacheKey(request);
	if (!key) {
		return null;
	}
	const cached = await cache.match(key);
	return cached ?? null;
}

/**
 * Store a response in Cloudflare edge cache
 * Only caches successful GET responses without Set-Cookie headers
 * @param request - The original request
 * @param response - The response to cache
 * @param cache - Cache instance to store in
 * @param options - Caching options (TTL, etc.)
 * @returns Promise that resolves when the response is cached
 */
export async function setEdgeCached(
	request: Request,
	response: Response,
	cache: Cache,
	options: EdgeCacheOptions = {}
): Promise<void> {
	const key = buildEdgeCacheKey(request);
	if (!key) {
		return;
	}

	// Do not cache responses that set cookies or are non-OK
	if (!response.ok || response.headers.has('Set-Cookie')) {
		return;
	}

	const ttl = options.ttl ?? 300; // default 5 minutes
	const headers = new Headers(response.headers);
	headers.set('Cache-Control', `public, max-age=${ttl}`);
	const cacheable = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});

	await cache.put(key, cacheable);
}

/**
 * Add edge cache diagnostic headers to a response
 * Adds x-edge-cache header indicating cache hit or miss
 * @param response - The response to augment
 * @param hit - Whether this was a cache hit
 * @returns New response with added headers
 */
export function withEdgeCacheHeaders(response: Response, hit: boolean): Response {
	const headers = new Headers(response.headers);
	headers.set('x-edge-cache', hit ? 'hit' : 'miss');
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

/**
 * Determine if a request is eligible for edge caching
 * Excludes: non-GET requests, authenticated requests, admin/api routes
 * @param request - The incoming request
 * @param url - Parsed URL of the request
 * @returns True if the request can be edge cached
 */
export function canEdgeCache(request: Request, url: URL): boolean {
	if (request.method !== 'GET') {
		return false;
	}
	if (request.headers.has('cookie')) {
		return false;
	}
	if (url.pathname.startsWith('/admin')) {
		return false;
	}
	if (url.pathname.startsWith('/api')) {
		return false;
	}
	return true;
}
