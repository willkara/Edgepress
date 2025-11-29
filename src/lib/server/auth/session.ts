/**
 * Session Management
 *
 * Manages user sessions in Cloudflare KV with automatic TTL expiration.
 * KV key pattern: session:{userId}:{hash(token)}
 */

import type { KVNamespace } from '@cloudflare/workers-types';
import type { SessionData } from './types';
import { SESSION_TTL } from './types';

function isSessionData(value: unknown): value is SessionData {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const session = value as Record<string, unknown>;
	return (
		typeof session.userId === 'string' &&
		typeof session.createdAt === 'string' &&
		typeof session.lastAccessedAt === 'string' &&
		(session.userAgent === undefined || typeof session.userAgent === 'string')
	);
}

/**
 * Generate a simple hash of the token for KV key
 * We hash the token to avoid exposing it in KV key lists
 * @param token - JWT token to hash
 * @returns Promise<string> - Hex encoded hash
 */
async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(token);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex.substring(0, 32); // Use first 32 chars for shorter keys
}

/**
 * Generate KV key for session
 * Format: session:{userId}:{hash(token)}
 * @param userId - User ID
 * @param token - JWT token
 * @returns Promise<string> - KV key
 */
async function generateSessionKey(userId: string, token: string): Promise<string> {
	const tokenHash = await hashToken(token);
	return `session:${userId}:${tokenHash}`;
}

/**
 * Create a new session in KV storage
 * @param kv - KV namespace
 * @param sessionId - Unique session identifier (JWT token)
 * @param userId - User ID to associate with session
 * @param ttl - Time to live in seconds (default: 86400 = 24 hours)
 * @param userAgent - Optional user agent string for auditing
 * @returns Promise<void>
 */
export async function createSession(
	kv: KVNamespace,
	sessionId: string,
	userId: string,
	ttl: number = SESSION_TTL,
	userAgent?: string
): Promise<void> {
	const key = await generateSessionKey(userId, sessionId);

	const sessionData: SessionData = {
		userId,
		createdAt: new Date().toISOString(),
		lastAccessedAt: new Date().toISOString(),
		userAgent
	};

	await kv.put(key, JSON.stringify(sessionData), {
		expirationTtl: ttl
	});
}

/**
 * Get session data from KV storage
 * @param kv - KV namespace
 * @param sessionId - Session identifier to lookup (JWT token)
 * @param userId - User ID (required to construct key)
 * @returns Promise<SessionData | null>
 */
export async function getSession(
	kv: KVNamespace,
	sessionId: string,
	userId: string
): Promise<SessionData | null> {
	try {
		const key = await generateSessionKey(userId, sessionId);
		const data = await kv.get(key, 'text');

		if (!data) {
			return null;
		}

		const parsed = JSON.parse(data) as unknown;
		if (!isSessionData(parsed)) {
			return null;
		}
		return parsed;
	} catch (error) {
		console.error('Error retrieving session:', error);
		return null;
	}
}

/**
 * Delete a session from KV storage
 * @param kv - KV namespace
 * @param sessionId - Session identifier to delete (JWT token)
 * @param userId - User ID (required to construct key)
 * @returns Promise<void>
 */
export async function deleteSession(
	kv: KVNamespace,
	sessionId: string,
	userId: string
): Promise<void> {
	try {
		const key = await generateSessionKey(userId, sessionId);
		await kv.delete(key);
	} catch (error) {
		console.error('Error deleting session:', error);
		// Don't throw - logout should always succeed
	}
}

/**
 * Refresh session TTL (extend expiration)
 * Also updates lastAccessedAt timestamp
 * @param kv - KV namespace
 * @param sessionId - Session identifier (JWT token)
 * @param userId - User ID (required to construct key)
 * @param ttl - New TTL in seconds
 * @returns Promise<boolean> - True if session exists and was refreshed
 */
export async function refreshSession(
	kv: KVNamespace,
	sessionId: string,
	userId: string,
	ttl: number = SESSION_TTL
): Promise<boolean> {
	try {
		const key = await generateSessionKey(userId, sessionId);
		const data = await kv.get(key, 'text');

		if (!data) {
			return false;
		}

		const parsed = JSON.parse(data) as unknown;
		if (!isSessionData(parsed)) {
			return false;
		}

		const sessionData = parsed;

		// Update lastAccessedAt
		sessionData.lastAccessedAt = new Date().toISOString();

		// Put with new TTL
		await kv.put(key, JSON.stringify(sessionData), {
			expirationTtl: ttl
		});

		return true;
	} catch (error) {
		console.error('Error refreshing session:', error);
		return false;
	}
}
