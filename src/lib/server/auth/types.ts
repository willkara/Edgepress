/**
 * Authentication Type Definitions
 *
 * Centralized TypeScript types for the authentication system.
 */

// Database user record (includes password_hash)
export interface User {
	id: string;
	email: string;
	password_hash: string;
	display_name: string;
	created_at: string;
	updated_at: string;
}

// Public user data (safe to expose in API responses)
export interface PublicUser {
	id: string;
	email: string;
	display_name: string;
}

// JWT token payload structure
export interface TokenPayload {
	sub: string; // User ID (subject)
	email: string;
	display_name: string;
	iat?: number; // Issued at (added by jose)
	exp?: number; // Expiration (added by jose)
}

// KV session data structure
export interface SessionData {
	userId: string;
	createdAt: string; // ISO timestamp
	lastAccessedAt: string; // ISO timestamp
	userAgent?: string; // Optional: for security auditing
}

// Login credentials from client
export interface LoginCredentials {
	email: string;
	password: string;
}

// Login API response
export interface LoginResult {
	success: boolean;
	user?: PublicUser;
	error?: string;
}

// Session check API response
export interface SessionCheckResult {
	authenticated: boolean;
	user?: PublicUser;
}

// Password validation result
export interface PasswordValidationResult {
	valid: boolean;
	errors: string[];
}

// Constants
export const SESSION_COOKIE_NAME = 'edgepress_session';
export const SESSION_TTL = 86400; // 24 hours in seconds
export const JWT_EXPIRATION = '24h'; // JWT expiration duration
