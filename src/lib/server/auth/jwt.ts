/**
 * JWT Operations
 *
 * Handles JWT token generation and verification using the jose library.
 * jose is Cloudflare Workers compatible (unlike jsonwebtoken which requires Node.js).
 */

import { SignJWT, jwtVerify } from 'jose';
import type { TokenPayload } from './types';
import { JWT_EXPIRATION } from './types';

/**
 * Generate a signed JWT token for a user
 * @param payload - User data to encode (id, email, display_name)
 * @param secret - JWT secret from environment
 * @param expiresIn - Token expiration time (default: '24h')
 * @returns Promise<string> - Signed JWT token
 */
export async function generateToken(
	payload: Omit<TokenPayload, 'iat' | 'exp'>,
	secret: string,
	expiresIn: string = JWT_EXPIRATION
): Promise<string> {
	// Convert secret string to Uint8Array for jose
	const secretKey = new TextEncoder().encode(secret);

	// Create and sign JWT
	const jwt = await new SignJWT({
		sub: payload.sub,
		email: payload.email,
		display_name: payload.display_name
	})
		.setProtectedHeader({ alg: 'HS256' }) // HMAC SHA-256
		.setIssuedAt() // Set iat claim
		.setExpirationTime(expiresIn) // Set exp claim
		.sign(secretKey);

	return jwt;
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @param secret - JWT secret from environment
 * @returns Promise<TokenPayload | null> - Decoded payload or null if invalid
 */
export async function verifyToken(token: string, secret: string): Promise<TokenPayload | null> {
	try {
		// Convert secret string to Uint8Array for jose
		const secretKey = new TextEncoder().encode(secret);

		// Verify JWT signature and expiration
		const { payload } = await jwtVerify(token, secretKey, {
			algorithms: ['HS256']
		});

		// Extract and return the payload
		return {
			sub: payload.sub as string,
			email: payload.email as string,
			display_name: payload.display_name as string,
			iat: payload.iat,
			exp: payload.exp
		};
	} catch (error) {
		// Token is invalid or expired
		// Don't log the full error in production (may contain sensitive data)
		if (error instanceof Error) {
			console.error('JWT verification failed:', error.message);
		}
		return null;
	}
}

/**
 * Extract JWT token from cookie string
 * Manually parses cookies (no Node.js dependencies)
 * @param cookieHeader - The Cookie header value
 * @param cookieName - Name of the session cookie
 * @returns string | null - The token or null if not found
 */
export function extractTokenFromCookie(
	cookieHeader: string | null,
	cookieName: string
): string | null {
	if (!cookieHeader) {
		return null;
	}

	// Parse cookies manually (format: "name1=value1; name2=value2")
	const cookies = cookieHeader.split(';').map((c) => c.trim());

	// Find the session cookie
	const sessionCookie = cookies.find((c) => c.startsWith(`${cookieName}=`));

	if (!sessionCookie) {
		return null;
	}

	// Extract the token value
	const token = sessionCookie.substring(cookieName.length + 1);

	return token || null;
}
