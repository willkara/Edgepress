<script lang="ts">
	import { formatDateStandard } from '$lib/utils/date';
	import DOMPurify from 'isomorphic-dompurify';
	import type { PageData } from './$types';
	import { extractToc, type TocItem } from '$lib/utils/toc';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import CopyCodeButton from '$lib/components/CopyCodeButton.svelte';

	let { data }: { data: PageData } = $props();
	const page = data.page;

	// Build breadcrumbs for the page
	const breadcrumbItems = page ? [
		{ label: 'Home', href: '/' },
		{ label: page.title }
	] : [];

	// Initialize state for table of contents and sanitized content
	let toc = $state<TocItem[]>([]);
	let sanitizedContent = $state('');
	let activeHeadingId = $state('');

	let observer: IntersectionObserver | undefined;

	// Extract TOC and sanitize content on mount
	$effect(() => {
		if (page) {
			const { toc: extractedToc, html: modifiedHtml } = extractToc(page.content_html);
			toc = extractedToc;
			sanitizedContent = DOMPurify.sanitize(modifiedHtml);

			// Set up intersection observer for TOC active heading
			observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						activeHeadingId = entry.target.id;
					}
				});
			}, {
				rootMargin: '-50% 0px -50% 0px',
				threshold: 0
			});

			const articleBody = document.querySelector('.article-body');
			if (articleBody) {
				articleBody.querySelectorAll('h2, h3').forEach(heading => {
					observer?.observe(heading);
				});
			}
		}

		return () => {
			observer?.disconnect();
			observer = undefined;
		};
	});
</script>

<svelte:head>
	<title>{page?.title || 'EdgePress'} - EdgePress</title>
	<meta name="description" content={page?.excerpt || page?.title || 'A serverless blog platform powered by Cloudflare'} />
	<!-- Open Graph / Social Media Meta Tags -->
	<meta property="og:title" content={page?.title || 'EdgePress'} />
	<meta property="og:description" content={page?.excerpt || page?.title || 'A serverless blog platform powered by Cloudflare'} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://yourdomain.com/${page?.slug || ''}`} />
	{#if page?.hero_image_id}
		<meta property="og:image" content={`https://imagedelivery.net/YOUR_CF_ACCOUNT_HASH/${page.hero_image_id}/public`} />
	{/if}
</svelte:head>

{#if page}
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
					<span>By {page.author_name}</span>
					{#if page.published_at}
						<span>· Published {formatDateStandard(page.published_at)}</span>
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
			<TableOfContents toc={toc} activeHeadingId={activeHeadingId} />
		{/if}
	</div>
{:else}
	<!-- Fallback for when page is null -->
	<div class="relative mx-auto flex max-w-screen-xl px-4 py-8 text-center text-lg text-muted-foreground">
		<p>Page not found. Please check the URL.</p>
	</div>
{/if}
