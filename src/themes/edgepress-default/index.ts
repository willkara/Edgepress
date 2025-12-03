/**
 * EdgePress Default Theme
 *
 * Main theme export file. This file exports the complete theme object
 * that implements the EdgePressTheme interface.
 */

import type { EdgePressTheme } from '$lib/themes/contracts';
import { themeConfig } from './theme.config';

// Import all theme components
import Layout from './components/ThemeLayout.svelte';
import PostSingle from './components/PostSingle.svelte';
import PostList from './components/PostList.svelte';
import PageSingle from './components/PageSingle.svelte';
import HomeIndex from './components/HomeIndex.svelte';
import CategoryArchive from './components/CategoryArchive.svelte';
import TagArchive from './components/TagArchive.svelte';
import SearchResults from './components/SearchResults.svelte';

/**
 * Default theme implementation
 *
 * This theme provides a clean, minimal design focused on readability
 * and content. It includes full support for blog posts, static pages,
 * categories, tags, and search.
 */
export const defaultTheme: EdgePressTheme = {
	config: themeConfig,
	components: {
		Layout,
		PostSingle,
		PostList,
		PageSingle,
		HomeIndex,
		CategoryArchive,
		TagArchive,
		SearchResults
	}
};

export default defaultTheme;
