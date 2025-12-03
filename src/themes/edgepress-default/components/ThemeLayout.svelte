<script lang="ts">
	/**
	 * ThemeLayout Component
	 *
	 * Main layout wrapper for the EdgePress Default Theme.
	 * This component provides the overall site structure including:
	 * - Site header/navigation
	 * - Sidebar (desktop)
	 * - Mobile navigation
	 * - Main content area
	 * - Footer
	 * - Accessibility features
	 * - Visual enhancements
	 */

	import PublicSidebar from '$lib/components/PublicSidebar.svelte';
	import MobilePublicNav from '$lib/components/MobilePublicNav.svelte';
	import AnimatedOrbs from '$lib/components/AnimatedOrbs.svelte';
	import PageTransition from '$lib/components/PageTransition.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import SkipToContent from '$lib/components/SkipToContent.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import type { ThemeLayoutProps } from '$lib/themes/contracts';

	// Props from theme contract
	let {
		title,
		description,
		ogImage,
		path,
		site,
		themeConfig,
		themeOptions,
		children
	}: ThemeLayoutProps = $props();

	// Extract user from global context (will be passed via route data)
	// For now, we'll handle this in the integration step
	// The layout needs access to user data for the navigation components
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	<meta property="og:title" content={title} />
	<meta property="og:url" content="{site.url}{path}" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SkipToContent />
<AnimatedOrbs />
<PageTransition />
<ScrollToTop />
<MobileBottomNav />
<PullToRefresh />

<div class="min-h-screen flex flex-col lg:flex-row">
	<!-- Mobile Header (visible only on small screens) -->
	<MobilePublicNav user={undefined} />

	<!-- Desktop Sidebar (hidden on small screens, fixed on large) -->
	<div class="hidden lg:block w-[260px] shrink-0 h-screen sticky top-0">
		<PublicSidebar user={undefined} />
	</div>

	<!-- Main Content Area -->
	<main id="main-content" class="flex-1 min-w-0">
		<div class="container max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-10">
			{@render children()}
		</div>
	</main>
</div>
