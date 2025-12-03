<script lang="ts">
	/**
	 * PageSingle Component
	 *
	 * Displays a single static page with optional table of contents.
	 * Similar to PostSingle but without post-specific features like
	 * categories, tags, reactions, or related content.
	 */

	import { formatDateStandard } from '$lib/utils/date';
	import DOMPurify from 'isomorphic-dompurify';
	import { extractToc, type TocItem } from '$lib/utils/toc';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import CopyCodeButton from '$lib/components/CopyCodeButton.svelte';
	import type { PageSingleProps } from '$lib/themes/contracts';

	// Props from theme contract
	let { page, themeConfig, themeOptions }: PageSingleProps = $props();

	// Build breadcrumbs for the page
	const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: page.title }];

	// Initialize state for table of contents and sanitized content
	let toc = $state<TocItem[]>([]);
	let sanitizedContent = $state('');
	let activeHeadingId = $state('');
	let observer: IntersectionObserver | undefined;

	// Extract TOC and sanitize content
	$effect(() => {
		const { toc: extractedToc, html: modifiedHtml } = extractToc(page.content_html);
		toc = extractedToc;
		sanitizedContent = DOMPurify.sanitize(modifiedHtml);

		// Set up intersection observer for TOC active heading
		observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeHeadingId = entry.target.id;
					}
				});
			},
			{
				rootMargin: '-50% 0px -50% 0px',
				threshold: 0
			}
		);

		const articleBody = document.querySelector('.article-body');
		if (articleBody) {
			articleBody.querySelectorAll('h2, h3').forEach((heading) => {
				observer?.observe(heading);
			});
		}

		return () => {
			observer?.disconnect();
			observer = undefined;
		};
	});
</script>

<div class="relative mx-auto flex max-w-screen-xl px-4 py-8">
	<!-- Main Page Content -->
	<div class="flex-1 min-w-0 max-w-prose mx-auto">
		<div class="mb-8">
			<a href="/" class="article-back">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
				Back to home
			</a>

			<Breadcrumbs items={breadcrumbItems} />

			<div class="article-meta flex flex-wrap items-center gap-x-2 gap-y-1">
				{#if page.published_at}
					<span>Published {formatDateStandard(page.published_at)}</span>
				{/if}
				{#if page.updated_at && page.updated_at !== page.published_at}
					<span>· Updated {formatDateStandard(page.updated_at)}</span>
				{/if}
			</div>

			<h1 class="article-title">{page.title}</h1>

			{#if page.excerpt}
				<p class="text-lg text-muted-foreground mb-6">{page.excerpt}</p>
			{/if}
		</div>

		<div class="article-body">
			{@html sanitizedContent}
			<CopyCodeButton />
		</div>
	</div>

	<!-- Table of Contents Sidebar -->
	{#if toc.length > 0}
		<TableOfContents {toc} {activeHeadingId} />
	{/if}
</div>
