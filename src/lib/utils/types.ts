/**
 * TypeScript Utility Types
 *
 * Common utility types used throughout the EdgePress application
 * Primarily for Svelte component prop typing
 */

/**
 * Add an optional ref property to a component's props
 * Used for forwarding refs to underlying HTML elements
 * @template T - The type of the HTML element (defaults to HTMLElement)
 */
export type WithElementRef<T = HTMLElement> = {
	ref?: T | null;
};

/**
 * Omit the 'child' property from a type
 * Used when a component doesn't support the 'child' snippet
 */
export type WithoutChild<T> = Omit<T, 'child'>;

/**
 * Omit the 'children' property from a type
 * Used when a component doesn't support the 'children' snippet
 */
export type WithoutChildren<T> = Omit<T, 'children'>;

/**
 * Omit both 'children' and 'child' properties from a type
 * Used when a component doesn't support either snippet
 */
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;
