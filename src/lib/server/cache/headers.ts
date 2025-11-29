/**
 * HTTP Cache-Control header utilities for EdgePress
 * Leverages Cloudflare's edge cache for optimal performance
 */

export interface CacheHeaderOptions {
	/**
	 * Max age in seconds - how long the browser should cache the response
	 */
	maxAge?: number;

	/**
	 * Shared max age in seconds - how long Cloudflare edge should cache
	 */
	sMaxAge?: number;

	/**
	 * Allow serving stale content while revalidating in background
	 */
	staleWhileRevalidate?: number;

	/**
	 * Allow serving stale content if origin is down
	 */
	staleIfError?: number;

	/**
	 * Make response private (browser only, no CDN caching)
	 */
	private?: boolean;

	/**
	 * Disable all caching
	 */
	noCache?: boolean;

	/**
	 * Must revalidate with origin before serving stale content
	 */
	mustRevalidate?: boolean;
}

/**
 * Build a Cache-Control header value from options
 */
export function buildCacheControl(options: CacheHeaderOptions): string {
	const directives: string[] = [];

	if (options.noCache) {
		directives.push('no-cache', 'no-store', 'must-revalidate');
		return directives.join(', ');
	}

	if (options.private) {
		directives.push('private');
	} else {
		directives.push('public');
	}

	if (options.maxAge !== undefined) {
		directives.push(`max-age=${options.maxAge}`);
	}

	if (options.sMaxAge !== undefined) {
		directives.push(`s-maxage=${options.sMaxAge}`);
	}

	if (options.staleWhileRevalidate !== undefined) {
		directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
	}

	if (options.staleIfError !== undefined) {
		directives.push(`stale-if-error=${options.staleIfError}`);
	}

	if (options.mustRevalidate) {
		directives.push('must-revalidate');
	}

	return directives.join(', ');
}

/**
 * Preset cache configurations for common use cases
 */
export const CachePresets = {
	/**
	 * Public pages (blog posts, home page)
	 * - Browser: 5 minutes
	 * - Edge: 10 minutes
	 * - Stale while revalidate: 1 hour
	 */
	publicPage: (): string =>
		buildCacheControl({
			maxAge: 300, // 5 minutes
			sMaxAge: 600, // 10 minutes
			staleWhileRevalidate: 3600 // 1 hour
		}),

	/**
	 * Static assets (images, fonts, CSS, JS)
	 * - Browser: 1 hour
	 * - Edge: 1 day
	 * - Stale while revalidate: 1 week
	 */
	staticAsset: (): string =>
		buildCacheControl({
			maxAge: 3600, // 1 hour
			sMaxAge: 86400, // 1 day
			staleWhileRevalidate: 604800 // 1 week
		}),

	/**
	 * API responses (read-only data)
	 * - Browser: 1 minute
	 * - Edge: 5 minutes
	 * - Stale while revalidate: 30 minutes
	 */
	apiRead: (): string =>
		buildCacheControl({
			maxAge: 60, // 1 minute
			sMaxAge: 300, // 5 minutes
			staleWhileRevalidate: 1800 // 30 minutes
		}),

	/**
	 * Admin pages and authenticated content
	 * - No caching at all
	 */
	noCache: (): string =>
		buildCacheControl({
			noCache: true
		}),

	/**
	 * Private content (user-specific data)
	 * - Browser only: 5 minutes
	 * - No CDN caching
	 */
	private: (): string =>
		buildCacheControl({
			private: true,
			maxAge: 300, // 5 minutes
			mustRevalidate: true
		})
};

/**
 * Apply cache headers to a Response
 */
export function withCacheHeaders(
	response: Response,
	cacheControl: string,
	additionalHeaders?: Record<string, string>
): Response {
	const headers = new Headers(response.headers);
	headers.set('Cache-Control', cacheControl);

	// Add Vary header for content negotiation
	if (!headers.has('Vary')) {
		headers.set('Vary', 'Accept-Encoding');
	}

	// Add additional headers if provided
	if (additionalHeaders) {
		for (const [key, value] of Object.entries(additionalHeaders)) {
			headers.set(key, value);
		}
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

/**
 * Set cache headers on SvelteKit's setHeaders function
 */
export function setCacheHeaders(
	setHeaders: (headers: Record<string, string>) => void,
	cacheControl: string
): void {
	setHeaders({
		'Cache-Control': cacheControl,
		Vary: 'Accept-Encoding'
	});
}
