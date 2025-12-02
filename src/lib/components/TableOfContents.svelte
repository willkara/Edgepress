<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronDown, List } from 'lucide-svelte';
	import type { TocItem } from '$lib/utils/toc';

	let { toc, activeHeadingId }: { toc: TocItem[]; activeHeadingId: string } = $props();

	let isCollapsed = $state(false);
	let isSticky = $state(false);
	let scrollProgress = $state(0);

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
		// Save preference to localStorage
		try {
			localStorage.setItem('toc-collapsed', isCollapsed.toString());
		} catch {
			// Ignore localStorage errors
		}
	}

	function smoothScrollToHeading(id: string, event: Event) {
		event.preventDefault();
		const element = document.getElementById(id);
		if (element) {
			const offset = 80; // Account for fixed header
			const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
			window.scrollTo({
				top: elementPosition - offset,
				behavior: 'smooth'
			});
		}
	}

	onMount(() => {
		// Restore collapse state from localStorage
		try {
			const saved = localStorage.getItem('toc-collapsed');
			if (saved !== null) {
				isCollapsed = saved === 'true';
			}
		} catch {
			// Ignore localStorage errors
		}

		// Track scroll for sticky detection and progress
		function handleScroll() {
			// Detect sticky state (when scrolled past initial position)
			isSticky = window.scrollY > 100;

			// Calculate overall reading progress based on active heading position
			if (toc.length > 0 && activeHeadingId) {
				const activeIndex = toc.findIndex((item) => item.id === activeHeadingId);
				if (activeIndex !== -1) {
					scrollProgress = ((activeIndex + 1) / toc.length) * 100;
				}
			}
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll(); // Initial call

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<aside
	class="toc-sidebar hidden md:block w-60 pl-8"
	class:sticky={!isCollapsed}
	class:is-sticky={isSticky && !isCollapsed}
	aria-label="Table of contents"
>
	<div class="toc-header">
		<div class="toc-title-row">
			<List class="w-4 h-4 text-muted" />
			<h4 class="toc-title">On this page</h4>
			<button
				class="collapse-button"
				onclick={toggleCollapse}
				aria-expanded={!isCollapsed}
				aria-label={isCollapsed ? 'Expand table of contents' : 'Collapse table of contents'}
			>
				<ChevronDown class={`w-4 h-4 ${isCollapsed ? 'rotated' : ''}`} />
			</button>
		</div>

		{#if !isCollapsed && scrollProgress > 0}
			<div class="progress-bar" aria-hidden="true">
				<div class="progress-fill" style="width: {scrollProgress}%"></div>
			</div>
		{/if}
	</div>

	{#if !isCollapsed}
		<nav class="toc-nav">
			{#each toc as item (item.id)}
				<a
					href={`#${item.id}`}
					class="toc-link"
					class:level-2={item.level === 2}
					class:level-3={item.level === 3}
					class:active={activeHeadingId === item.id}
					onclick={(e) => smoothScrollToHeading(item.id, e)}
					tabindex="0"
				>
					<span class="toc-bullet" class:active={activeHeadingId === item.id}></span>
					<span class="toc-text">{item.text}</span>
				</a>
			{/each}
		</nav>
	{/if}
</aside>

<style>
	.toc-sidebar {
		position: sticky;
		top: 5rem;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		padding-bottom: 2rem;
		transition: all 200ms ease;
	}

	.toc-sidebar.is-sticky {
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
		padding: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.toc-header {
		margin-bottom: 0.75rem;
		position: sticky;
		top: 0;
		background: inherit;
		z-index: 1;
	}

	.toc-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.toc-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex: 1;
		margin: 0;
	}

	.collapse-button {
		padding: 0.25rem;
		background: transparent;
		border: none;
		color: var(--text-subtle);
		cursor: pointer;
		transition: all 150ms;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.collapse-button:hover {
		background: var(--bg-soft);
		color: var(--accent);
	}

	.collapse-button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.collapse-button :global(svg) {
		transition: transform 200ms ease;
	}

	.collapse-button :global(svg.rotated) {
		transform: rotate(-90deg);
	}

	.progress-bar {
		height: 2px;
		background: var(--border-subtle);
		border-radius: 999px;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent-strong), var(--accent));
		transition: width 300ms ease;
		border-radius: 999px;
	}

	.toc-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.toc-link {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.875rem;
		text-decoration: none;
		color: var(--text-muted);
		border-radius: 0.375rem;
		transition: all 150ms;
		position: relative;
	}

	.toc-link.level-3 {
		padding-left: 1.5rem;
		font-size: 0.8125rem;
	}

	.toc-link:hover {
		background: var(--bg-soft);
		color: var(--accent);
	}

	.toc-link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.toc-link.active {
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 500;
	}

	.toc-bullet {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-subtle);
		flex-shrink: 0;
		margin-top: 0.375rem;
		transition: all 150ms;
	}

	.toc-bullet.active {
		background: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
		transform: scale(1.2);
	}

	.toc-text {
		flex: 1;
		line-height: 1.5;
	}

	/* Scrollbar styling */
	.toc-sidebar::-webkit-scrollbar {
		width: 4px;
	}

	.toc-sidebar::-webkit-scrollbar-track {
		background: transparent;
	}

	.toc-sidebar::-webkit-scrollbar-thumb {
		background: var(--border-subtle);
		border-radius: 999px;
	}

	.toc-sidebar::-webkit-scrollbar-thumb:hover {
		background: var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.toc-sidebar,
		.toc-link,
		.collapse-button :global(svg),
		.progress-fill,
		.toc-bullet {
			transition: none;
		}
	}
</style>
