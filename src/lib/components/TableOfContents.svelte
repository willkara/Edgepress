<script lang="ts">
	import type { TocItem } from '$lib/utils/toc';
    import { activeHeadingId, setupHeadingObserver } from '$lib/stores/activeHeading';
    import { onMount } from 'svelte';

	let { toc }: { toc: TocItem[] } = $props();

    // Subscribe to store
    // let activeId = $state(''); // Not needed if we use $activeHeadingId

    onMount(() => {
        // We set up the observer here.
        // Note: Multiple components might call this. That's okay,
        // but ideally we only want one observer.
        // For now, let's assume TableOfContents is the primary driver.
        // But what if TOC is hidden on mobile? MobileArticleNav needs it.
        // It's safe to have multiple observers, or we can check if already set up.
        // The simple implementation in store just creates a new observer each time.
        // Let's just call it.
        const cleanup = setupHeadingObserver();
        return cleanup;
    });
</script>

<aside class="toc-sidebar sticky top-20 hidden md:block w-60 pl-8">
	<h4 class="text-sm font-semibold mb-3 text-muted-foreground">On this page</h4>
	<nav class="space-y-2">
		{#each toc as item (item.id)}
			<a
				href={`#${item.id}`}
				class="block text-sm transition-colors hover:text-accent-strong"
				class:pl-4={item.level === 3}
				class:font-medium={item.level === 2}
				class:text-accent={$activeHeadingId === item.id}
				class:text-text-muted={$activeHeadingId !== item.id}
				style="padding-left: {item.level === 3 ? '1.5rem' : '0'};"
			>
				{item.text}
			</a>
		{/each}
	</nav>
</aside>
