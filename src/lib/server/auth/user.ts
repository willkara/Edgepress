/**
 * User Database Operations
 *
 * Handles user queries following the established D1 database pattern.
 * Uses prepare().bind().first<T>() for single results.
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { User, PublicUser } from './types';

/**
 * Get user by email address
 * Used for login authentication
 * @param db - D1 database instance
 * @param email - User email to lookup
 * @returns Promise<User | null>
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
	const query = `
		SELECT id, email, password_hash, display_name, created_at, updated_at
		FROM users
		WHERE email = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(email).first<User>();
	return result ?? null;
}

/**
 * Get user by ID
 * Returns full user record including password_hash
 * @param db - D1 database instance
 * @param userId - User ID to lookup
 * @returns Promise<User | null>
 */
export async function getUserById(db: D1Database, userId: string): Promise<User | null> {
	const query = `
		SELECT id, email, password_hash, display_name, created_at, updated_at
		FROM users
		WHERE id = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(userId).first<User>();
	return result ?? null;
}

/**
 * Get public user data (excludes password_hash)
 * Safe to expose in API responses and event.locals
 * @param db - D1 database instance
 * @param userId - User ID to lookup
 * @returns Promise<PublicUser | null>
 */
export async function getPublicUser(db: D1Database, userId: string): Promise<PublicUser | null> {
	const query = `
		SELECT id, email, display_name
		FROM users
		WHERE id = ?
		LIMIT 1
	`;

	const result = await db.prepare(query).bind(userId).first<PublicUser>();
	return result ?? null;
}
