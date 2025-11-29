import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

type EnvKeys = Array<string>;

export interface RequiredEnv {
	DB: D1Database;
	CACHE: KVNamespace;
	SESSIONS: KVNamespace;
	JWT_SECRET: string;
	// Add other bindings as needed
}

/**
 * Assert required env bindings exist and narrow types.
 * Throws an Error if missing. Prefer this for API routes where env is mandatory.
 */
export function requireEnv(event: Pick<RequestEvent, 'platform'>, keys: EnvKeys): RequiredEnv {
	const env = event.platform?.env;
	if (!env) {
		throw new Error('Platform environment not available');
	}

	for (const key of keys) {
		if (!(key in env)) {
			throw new Error(`Missing env binding: ${String(key)}`);
		}
	}

	return env as RequiredEnv;
}

/**
 * Safe getter version: returns null instead of throwing when missing.
 */
export function getEnv(event: Pick<RequestEvent, 'platform'>, keys: EnvKeys): RequiredEnv | null {
	try {
		return requireEnv(event, keys);
	} catch {
		return null;
	}
}
