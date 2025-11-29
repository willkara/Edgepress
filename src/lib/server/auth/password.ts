/**
 * Password Operations
 *
 * Handles password hashing and verification using bcryptjs.
 * Uses cost factor 12 to match existing seed data.
 */

import bcrypt from 'bcryptjs';
import type { PasswordValidationResult } from './types';

/**
 * Hash a plaintext password using bcrypt
 * @param password - The plaintext password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt(12); // Cost factor 12 matches seed data
	return await bcrypt.hash(password, salt);
}

/**
 * Verify a plaintext password against a stored hash
 * Timing-safe comparison to prevent timing attacks
 * @param password - The plaintext password to verify
 * @param hash - The stored bcrypt hash
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	try {
		return await bcrypt.compare(password, hash);
	} catch (error) {
		console.error('Error verifying password:', error);
		// Return false on error (never expose internal errors)
		return false;
	}
}

/**
 * Validate password meets security requirements
 * @param password - The password to validate
 * @returns PasswordValidationResult - Validation result with errors
 */
export function validatePassword(password: string): PasswordValidationResult {
	const errors: string[] = [];

	// Minimum length requirement
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}

	// Maximum length (bcrypt has a 72 byte limit)
	if (password.length > 72) {
		errors.push('Password must be less than 72 characters long');
	}

	// For MVP, we only enforce length requirements
	// Future enhancements could add:
	// - Require uppercase/lowercase/numbers/special chars
	// - Check against common password lists
	// - Minimum entropy calculation

	return {
		valid: errors.length === 0,
		errors
	};
}
