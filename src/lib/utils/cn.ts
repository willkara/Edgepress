/**
 * Class Name Utilities
 *
 * Combines clsx and tailwind-merge for smart className merging
 * Handles Tailwind CSS class conflicts intelligently
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge and deduplicate class names with Tailwind CSS conflict resolution
 * Combines clsx for conditional classes with tailwind-merge for smart deduplication
 * @param inputs - Class names (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * @example
 * cn('px-2', 'px-4') // => 'px-4' (later value wins)
 * cn('p-4', { 'text-red-500': isError }) // => 'p-4 text-red-500' (if isError is true)
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
