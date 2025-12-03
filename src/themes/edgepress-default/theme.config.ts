/**
 * EdgePress Default Theme Configuration
 *
 * This is the official default theme for EdgePress.
 * It ports the existing design into the new component-based theming system.
 *
 * Theme Characteristics:
 * - Clean, minimal design focused on readability
 * - Responsive layout with mobile-first approach
 * - Dark mode support via mode-watcher
 * - Optimized for blogs and content-heavy sites
 * - Built with Tailwind CSS for styling
 */

import type { ThemeConfig } from '$lib/themes/contracts';

export const themeConfig: ThemeConfig = {
	id: 'edgepress-default',
	name: 'EdgePress Default',
	version: '1.0.0',
	author: 'EdgePress Team',
	description: 'The official default theme for EdgePress. Clean, minimal, and focused on content.',
	homepage: 'https://edgepress.dev/themes/default',

	// Theme options that can be customized without code changes
	// These could be controlled via admin UI in the future
	options: [
		{
			key: 'accentColor',
			label: 'Accent Color',
			type: 'color',
			default: '#3b82f6', // blue-500
			description: 'Primary accent color used for links, buttons, and highlights'
		},
		{
			key: 'headingFont',
			label: 'Heading Font',
			type: 'select',
			default: 'system',
			choices: [
				{ value: 'system', label: 'System Default' },
				{ value: 'serif', label: 'Serif' },
				{ value: 'mono', label: 'Monospace' }
			],
			description: 'Font family for headings'
		},
		{
			key: 'bodyFont',
			label: 'Body Font',
			type: 'select',
			default: 'system',
			choices: [
				{ value: 'system', label: 'System Default' },
				{ value: 'serif', label: 'Serif' },
				{ value: 'sans', label: 'Sans Serif' }
			],
			description: 'Font family for body text'
		},
		{
			key: 'showReadTime',
			label: 'Show Read Time',
			type: 'boolean',
			default: true,
			description: 'Display estimated reading time on blog posts'
		},
		{
			key: 'showAuthor',
			label: 'Show Author',
			type: 'boolean',
			default: true,
			description: 'Display author name on blog posts'
		},
		{
			key: 'showRelatedPosts',
			label: 'Show Related Posts',
			type: 'boolean',
			default: true,
			description: 'Display related posts at the end of blog posts'
		},
		{
			key: 'postsPerPage',
			label: 'Posts Per Page',
			type: 'number',
			default: 10,
			description: 'Number of posts to display per page in listings'
		}
	]
};
