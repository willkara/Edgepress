/**
 * Centralized caching utilities for EdgePress
 * Uses the CACHE KV namespace for read-heavy, write-light data
 */

import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * Options for caching operations
 */
export interface CacheOptions {
	/** Time to live in seconds */
	ttl?: number;
	/** Optional namespace prefix for cache keys */
	namespace?: string;
}

/** Default cache TTL (5 minutes) */
const DEFAULT_TTL = 300;

/**
 * Cache key patterns used throughout EdgePress:
 * - settings:all
 * - posts:published:{limit}:{offset}
 * - post:{slug}
 * - categories:all
 * - tags:all
 * - category:{slug}
 * - tag:{slug}
 * - cache:version (for invalidation)
 */

/**
 * Retrieve a cached value from KV storage
 * @template T - The type of the cached value
 * @param cache - KV namespace instance
 * @param key - Cache key to lookup
 * @returns Promise resolving to the cached value or undefined if not found/error
 */
export async function getCached<T>(cache: KVNamespace, key: string): Promise<T | undefined> {
	try {
		const cached = await cache.get(key);
		if (cached !== null) {
			return JSON.parse(cached) as T;
		}
	} catch (error) {
		console.error(`Cache read error for key ${key}:`, error);
	}
	return undefined;
}

/**
 * Store a value in KV cache with optional TTL
 * @template T - The type of the value to cache
 * @param cache - KV namespace instance
 * @param key - Cache key to store under
 * @param value - Value to cache (will be JSON serialized)
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns Promise that resolves when the value is cached
 */
export async function setCached<T>(
	cache: KVNamespace,
	key: string,
	value: T,
	ttl: number = DEFAULT_TTL
): Promise<void> {
	try {
		await cache.put(key, JSON.stringify(value), {
			expirationTtl: ttl
		});
	} catch (error) {
		console.error(`Cache write error for key ${key}:`, error);
	}
}

/**
 * Invalidate cached values by pattern
 * For wildcard patterns (containing '*'), increments a version counter
 * For exact keys, deletes the key directly
 * @param cache - KV namespace instance
 * @param pattern - Cache key pattern to invalidate
 * @returns Promise that resolves when invalidation is complete
 */
export async function invalidateCache(cache: KVNamespace, pattern: string): Promise<void> {
	// For wildcard invalidation, increment version
	if (pattern.includes('*')) {
		const versionKey = `cache:version:${pattern.replace('*', '')}`;
		const version = parseInt((await cache.get(versionKey)) ?? '0');
		await cache.put(versionKey, (version + 1).toString());
	} else {
		await cache.delete(pattern);
	}
}

/**
 * Build a namespaced cache key from components
 * @param prefix - Key prefix (e.g., 'posts', 'categories')
 * @param params - Additional parameters to append to the key
 * @returns Formatted cache key string
 * @example
 * getCacheKey('posts', 'published', 10, 0) // => 'posts:published:10:0'
 */
export function getCacheKey(prefix: string, ...params: (string | number)[]): string {
	return `${prefix}:${params.join(':')}`;
}
