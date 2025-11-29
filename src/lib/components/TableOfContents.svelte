<script lang="ts">
	import type { TocItem } from '$lib/utils/toc';

	let { toc, activeHeadingId }: { toc: TocItem[]; activeHeadingId: string } = $props();
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
				class:text-accent={activeHeadingId === item.id}
				class:text-text-muted={activeHeadingId !== item.id}
				style="padding-left: {item.level === 3 ? '1.5rem' : '0'};"
			>
				{item.text}
			</a>
		{/each}
	</nav>
</aside>