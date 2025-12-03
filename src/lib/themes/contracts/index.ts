/**
 * Theme System Contracts
 *
 * TypeScript interfaces that define the contract between EdgePress core
 * and theme packages. All themes must implement the EdgePressTheme interface.
 *
 * This allows themes to be developed as separate npm packages while
 * maintaining type safety and consistent APIs.
 */

import type { Snippet } from 'svelte';

/**
 * Theme metadata and configuration
 */
export interface ThemeConfig {
	/** Unique theme identifier (e.g., 'edgepress-default', 'elegant-blog') */
	id: string;

	/** Display name shown in theme listings */
	name: string;

	/** Theme version (semver) */
	version: string;

	/** Theme author name or organization */
	author: string;

	/** Brief description of the theme */
	description: string;

	/** Optional theme homepage URL */
	homepage?: string;

	/** Optional theme screenshot URL */
	screenshot?: string;

	/** Configurable theme options exposed to users */
	options?: ThemeOption[];
}

/**
 * Configurable theme option
 * Allows themes to expose customizable settings (colors, fonts, layout variants)
 * that can be controlled without code changes
 */
export interface ThemeOption {
	/** Option identifier (e.g., 'primaryColor', 'showSidebar') */
	key: string;

	/** Display label for the option */
	label: string;

	/** Option type determines the UI control */
	type: 'color' | 'font' | 'boolean' | 'select' | 'number' | 'text';

	/** Default value */
	default: string | number | boolean;

	/** Available choices (for 'select' type) */
	choices?: Array<{ value: string; label: string }>;

	/** Optional description/help text */
	description?: string;
}

/**
 * Base props passed to all theme components
 */
export interface BaseThemeProps {
	/** Active theme configuration */
	themeConfig: ThemeConfig;

	/** Theme-specific options (if any) */
	themeOptions?: Record<string, string | number | boolean>;
}

/**
 * Props for the main theme layout wrapper
 * This component wraps all pages and provides the overall site structure
 */
export interface ThemeLayoutProps extends BaseThemeProps {
	/** Page title for <title> tag */
	title: string;

	/** Page description for meta tags */
	description?: string;

	/** Open Graph image URL */
	ogImage?: string;

	/** Current page path (for active nav highlighting) */
	path: string;

	/** Site metadata */
	site: {
		name: string;
		description: string;
		url: string;
	};

	/** Page content (from child routes) */
	children: Snippet;
}

/**
 * Props for single blog post display
 */
export interface PostSingleProps extends BaseThemeProps {
	/** The blog post to display */
	post: {
		id: string;
		title: string;
		slug: string;
		content_html: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		updated_at: string;
		author_name: string;
		read_time: number;
		categories: Array<{ id: string; name: string; slug: string }>;
		tags: Array<{ id: string; name: string; slug: string }>;
	};

	/** Related posts (optional) */
	relatedPosts?: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
	}>;
}

/**
 * Props for blog post listings (index, category, tag, search)
 */
export interface PostListProps extends BaseThemeProps {
	/** List of posts to display */
	posts: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		author_name: string;
		read_time: number;
		categories: Array<{ id: string; name: string; slug: string }>;
		tags: Array<{ id: string; name: string; slug: string }>;
	}>;

	/** Pagination metadata */
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};

	/** Optional context (e.g., "Posts in Technology", "Posts tagged TypeScript") */
	context?: {
		type: 'category' | 'tag' | 'search';
		label: string;
		description?: string;
	};
}

/**
 * Props for static page display
 */
export interface PageSingleProps extends BaseThemeProps {
	/** The page to display */
	page: {
		id: string;
		title: string;
		slug: string;
		content_html: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		updated_at: string;
		template: string;
	};
}

/**
 * Props for homepage
 */
export interface HomeIndexProps extends BaseThemeProps {
	/** Featured/recent posts */
	posts: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		author_name: string;
		read_time: number;
		categories: Array<{ id: string; name: string; slug: string }>;
		tags: Array<{ id: string; name: string; slug: string }>;
	}>;

	/** Optional hero section data */
	hero?: {
		title: string;
		subtitle: string;
		image?: string;
		cta?: {
			text: string;
			href: string;
		};
	};
}

/**
 * Props for category archive pages
 */
export interface CategoryArchiveProps extends BaseThemeProps {
	/** Category metadata */
	category: {
		id: string;
		name: string;
		slug: string;
		description: string | null;
	};

	/** Posts in this category */
	posts: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		author_name: string;
		read_time: number;
		tags: Array<{ id: string; name: string; slug: string }>;
	}>;

	/** Pagination metadata */
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

/**
 * Props for tag archive pages
 */
export interface TagArchiveProps extends BaseThemeProps {
	/** Tag metadata */
	tag: {
		id: string;
		name: string;
		slug: string;
	};

	/** Posts with this tag */
	posts: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		author_name: string;
		read_time: number;
		categories: Array<{ id: string; name: string; slug: string }>;
	}>;

	/** Pagination metadata */
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

/**
 * Props for search results pages
 */
export interface SearchResultsProps extends BaseThemeProps {
	/** Search query */
	query: string;

	/** Search results */
	results: Array<{
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		hero_image_url: string | null;
		published_at: string;
		author_name: string;
		type: 'post' | 'page';
		/** Search relevance score (0-1) */
		score?: number;
	}>;

	/** Total number of results */
	total: number;
}

/**
 * Main theme interface
 * All EdgePress themes must implement this interface
 */
export interface EdgePressTheme {
	/** Theme metadata and configuration */
	config: ThemeConfig;

	/** Components that render different page types */
	components: {
		/** Main layout wrapper (wraps all pages) */
		Layout: import('svelte').Component<ThemeLayoutProps>;

		/** Single blog post view */
		PostSingle: import('svelte').Component<PostSingleProps>;

		/** Blog post listing (index, archives, search) */
		PostList: import('svelte').Component<PostListProps>;

		/** Single static page view */
		PageSingle: import('svelte').Component<PageSingleProps>;

		/** Homepage */
		HomeIndex: import('svelte').Component<HomeIndexProps>;

		/** Category archive page */
		CategoryArchive: import('svelte').Component<CategoryArchiveProps>;

		/** Tag archive page */
		TagArchive: import('svelte').Component<TagArchiveProps>;

		/** Search results page */
		SearchResults: import('svelte').Component<SearchResultsProps>;
	};
}

/**
 * Type guard to validate theme structure at runtime
 */
export function isValidTheme(theme: unknown): theme is EdgePressTheme {
	if (!theme || typeof theme !== 'object') return false;

	const t = theme as Partial<EdgePressTheme>;

	// Validate config
	if (!t.config || typeof t.config !== 'object') return false;
	if (!t.config.id || !t.config.name || !t.config.version) return false;

	// Validate components
	if (!t.components || typeof t.components !== 'object') return false;

	const requiredComponents = [
		'Layout',
		'PostSingle',
		'PostList',
		'PageSingle',
		'HomeIndex',
		'CategoryArchive',
		'TagArchive',
		'SearchResults'
	];

	for (const componentName of requiredComponents) {
		if (!(componentName in t.components)) return false;
	}

	return true;
}
