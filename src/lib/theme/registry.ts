
// src/lib/theme/registry.ts
import type { Component } from 'svelte';
import ReadingProgressBar from '$lib/components/ReadingProgressBar.svelte';
import TableOfContents from '$lib/components/TableOfContents.svelte';
import ViewCounter from '$lib/components/ViewCounter.svelte';
import MobileArticleNav from '$lib/components/MobileArticleNav.svelte';
import PublicSidebar from '$lib/components/PublicSidebar.svelte';
import MobilePublicNav from '$lib/components/MobilePublicNav.svelte';

// Registry mapping string names to Svelte components
export const componentRegistry: Record<string, Component<any>> = {
    'ReadingProgressBar': ReadingProgressBar,
    'TableOfContents': TableOfContents,
    'ViewCounter': ViewCounter,
    'MobileArticleNav': MobileArticleNav,
    'PublicSidebar': PublicSidebar,
    'MobilePublicNav': MobilePublicNav
};
