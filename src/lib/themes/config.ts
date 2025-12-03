/**
 * Theme Registry and Configuration
 *
 * Central registry for all available themes and configuration
 * for which theme is currently active.
 *
 * To add a new theme:
 * 1. Install theme package: npm install @edgepress/theme-name
 * 2. Import theme below
 * 3. Add to AVAILABLE_THEMES registry
 * 4. Update ACTIVE_THEME_ID to switch themes
 */

import type { EdgePressTheme } from './contracts';
import { isValidTheme } from './contracts';
import defaultTheme from '$themes/edgepress-default';

/**
 * Theme registry
 * Maps theme IDs to their implementations
 *
 * When adding a new theme:
 * - Import the theme package
 * - Add entry to this record with theme.config.id as key
 */
const AVAILABLE_THEMES: Record<string, EdgePressTheme> = {
	'edgepress-default': defaultTheme,
};

/**
 * Active theme ID
 *
 * Change this value to switch themes (requires rebuild + redeploy)
 *
 * IMPORTANT: The theme ID must exist in AVAILABLE_THEMES registry
 */
const ACTIVE_THEME_ID = 'edgepress-default';

/**
 * Get the currently active theme
 *
 * @throws {Error} If active theme is not found or invalid
 * @returns The active theme implementation
 *
 * @example
 * ```ts
 * import { getActiveTheme } from '$lib/themes/config';
 *
 * const theme = getActiveTheme();
 * const { Layout, PostSingle } = theme.components;
 * ```
 */
export function getActiveTheme(): EdgePressTheme {
	const theme = AVAILABLE_THEMES[ACTIVE_THEME_ID];

	if (!theme) {
		throw new Error(
			`Theme "${ACTIVE_THEME_ID}" not found in registry. ` +
			`Available themes: ${Object.keys(AVAILABLE_THEMES).join(', ')}`
		);
	}

	if (!isValidTheme(theme)) {
		throw new Error(
			`Theme "${ACTIVE_THEME_ID}" is invalid. ` +
			`It must implement the EdgePressTheme interface with all required components.`
		);
	}

	return theme;
}

/**
 * Get all available themes
 *
 * Useful for theme selection UIs (if build-time switching is acceptable)
 * or for documentation/debugging purposes.
 *
 * @returns Record of all registered themes
 */
export function getAllThemes(): Record<string, EdgePressTheme> {
	return AVAILABLE_THEMES;
}

/**
 * Get the active theme ID
 *
 * @returns The currently active theme ID
 */
export function getActiveThemeId(): string {
	return ACTIVE_THEME_ID;
}

/**
 * Check if a theme ID exists in the registry
 *
 * @param themeId - Theme ID to check
 * @returns True if theme exists, false otherwise
 */
export function themeExists(themeId: string): boolean {
	return themeId in AVAILABLE_THEMES;
}

/**
 * Register a theme dynamically
 *
 * This is primarily for testing or advanced use cases.
 * Most themes should be registered statically in AVAILABLE_THEMES.
 *
 * @param theme - Theme implementation to register
 * @throws {Error} If theme is invalid
 *
 * @example
 * ```ts
 * import customTheme from './themes/custom';
 * registerTheme(customTheme);
 * ```
 */
export function registerTheme(theme: EdgePressTheme): void {
	if (!isValidTheme(theme)) {
		throw new Error(
			`Cannot register theme "${theme.config?.id}": ` +
			`Theme must implement the EdgePressTheme interface`
		);
	}

	AVAILABLE_THEMES[theme.config.id] = theme;
}

/**
 * Development helper: List all registered theme IDs
 *
 * @returns Array of theme IDs
 */
export function listThemeIds(): string[] {
	return Object.keys(AVAILABLE_THEMES);
}
