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
	/** Optional tag for versioned cache invalidation (e.g. 'posts', 'settings') */
	tag?: string;
}

/** Default cache TTL (5 minutes) */
const DEFAULT_TTL = 300;

/**
 * Helper to get the current version for a tag
 */
async function getTagVersion(cache: KVNamespace, tag: string): Promise<string> {
	const versionKey = `cache:version:${tag}`;
	return (await cache.get(versionKey)) ?? '0';
}

/**
 * Retrieve a cached value from KV storage
 * @template T - The type of the cached value
 * @param cache - KV namespace instance
 * @param key - Cache key to lookup
 * @param options - Cache options including tag
 * @returns Promise resolving to the cached value or undefined if not found/error
 */
export async function getCached<T>(
	cache: KVNamespace,
	key: string,
	options: CacheOptions = {}
): Promise<T | undefined> {
	try {
		let lookupKey = key;
		if (options.tag) {
			const version = await getTagVersion(cache, options.tag);
			lookupKey = `${key}:v${version}`;
		}

		const cached = await cache.get(lookupKey);
		if (cached !== null) {
			return JSON.parse(cached) as T;
		}
	} catch (error) {
		console.error(`Cache read error for key ${key}:`, error);
	}
	return undefined;
}

/**
 * Store a value in KV cache
 * @template T - The type of the value to cache
 * @param cache - KV namespace instance
 * @param key - Cache key to store under
 * @param value - Value to cache (will be JSON serialized)
 * @param options - Cache options including TTL and tag
 * @returns Promise that resolves when the value is cached
 */
export async function setCached<T>(
	cache: KVNamespace,
	key: string,
	value: T,
	options: CacheOptions = {}
): Promise<void> {
	try {
		let storageKey = key;
		if (options.tag) {
			const version = await getTagVersion(cache, options.tag);
			storageKey = `${key}:v${version}`;
		}

		const ttl = options.ttl ?? DEFAULT_TTL;

		await cache.put(storageKey, JSON.stringify(value), {
			expirationTtl: ttl
		});
	} catch (error) {
		console.error(`Cache write error for key ${key}:`, error);
	}
}

/**
 * Invalidate cached values by tag (namespace)
 * Increments the version counter for the given tag, effectively invalidating all keys using it.
 * @param cache - KV namespace instance
 * @param tag - Cache tag to invalidate (e.g. 'posts')
 * @returns Promise that resolves when invalidation is complete
 */
export async function invalidateCache(cache: KVNamespace, tag: string): Promise<void> {
	const versionKey = `cache:version:${tag}`;
	const version = parseInt((await cache.get(versionKey)) ?? '0');
	await cache.put(versionKey, (version + 1).toString());
}

/**
 * Build a cache key from components
 * @param prefix - Key prefix (e.g., 'posts', 'categories')
 * @param params - Additional parameters to append to the key
 * @returns Formatted cache key string
 * @example
 * getCacheKey('posts', 'published', 10, 0) // => 'posts:published:10:0'
 */
export function getCacheKey(prefix: string, ...params: (string | number)[]): string {
	return `${prefix}:${params.join(':')}`;
}
