<script lang="ts">
	import { formatDateStandard } from '$lib/utils/date';
	import DOMPurify from 'isomorphic-dompurify';
	import type { PageData } from './$types';
	import ReadingProgressBar from '$lib/components/ReadingProgressBar.svelte';
	import { extractToc, type TocItem } from '$lib/utils/toc';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import ViewCounter from '$lib/components/ViewCounter.svelte';
	import MobileArticleNav from '$lib/components/MobileArticleNav.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import CopyCodeButton from '$lib/components/CopyCodeButton.svelte';
	import { AlertCircle, Eye } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	const post = data.post;

	// Calculate word count from markdown content
	const wordCount = post?.content_md
		? post.content_md.split(/\s+/).filter((word) => word.length > 0).length
		: 0;

	// Build breadcrumbs
	const breadcrumbItems = post
		? [
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: `Preview: ${post.title}` }
			]
		: [];

	let toc = $state<TocItem[]>([]);
	let sanitizedContent = $state('');
	let activeHeadingId = $state('');

	let observer: IntersectionObserver | undefined;

	$effect(() => {
		if (post) {
			const { toc: extractedToc, html: modifiedHtml } = extractToc(post.content_html);
			toc = extractedToc;
			sanitizedContent = DOMPurify.sanitize(modifiedHtml);

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
		}

		return () => {
			observer?.disconnect();
			observer = undefined;
		};
	});
</script>

<svelte:head>
	<title>Preview: {post?.title || 'Post'} - EdgePress</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if post}
	<ReadingProgressBar postSlug={post.slug} {wordCount} />

	<!-- Preview Banner -->
	<div class="preview-banner">
		<div class="preview-banner-content">
			<Eye class="w-5 h-5" />
			<div class="preview-banner-text">
				<strong>Preview Mode</strong>
				<span>
					This is a preview of an unpublished post. Changes may not reflect the final version.
					{#if post.preview_expires_at}
						· Expires {formatDateStandard(post.preview_expires_at)}
					{/if}
				</span>
			</div>
		</div>
		{#if post.status === 'draft'}
			<div class="preview-status draft">Draft</div>
		{:else if post.status === 'scheduled'}
			<div class="preview-status scheduled">Scheduled</div>
		{/if}
	</div>

	<div class="relative mx-auto flex max-w-screen-xl px-4 py-8">
		<!-- Main Article Content -->
		<div class="flex-1 min-w-0 max-w-prose mx-auto">
			<div class="mb-8">
				<a href="/blog" class="article-back">
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
					Back to blog
				</a>

				<Breadcrumbs items={breadcrumbItems} />

				<div class="article-meta flex flex-wrap items-center gap-x-2 gap-y-1">
					<span>By {post.author_name}</span>
					{#if post.status === 'published' && post.published_at}
						<span>· Published {formatDateStandard(post.published_at)}</span>
					{/if}
					{#if post.updated_at}
						<span>· Updated {formatDateStandard(post.updated_at)}</span>
					{/if}
					{#if post.category_name}
						<span>· <span class="category-link">{post.category_name}</span></span>
					{/if}
					{#if post.reading_time}
						<span>· {post.reading_time} min read</span>
					{/if}
				</div>
				<h1 class="article-title">{post.title}</h1>

				{#if post.excerpt}
					<p class="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
				{/if}

				{#if data.tags && data.tags.length > 0}
					<div class="article-tags">
						{#each data.tags as tag}
							<span class="tag">{tag.name}</span>
						{/each}
					</div>
				{/if}
			</div>

			<div class="article-body">
				{@html sanitizedContent}
				<CopyCodeButton />
			</div>

			<!-- Preview Notice -->
			<div class="preview-notice">
				<AlertCircle class="w-5 h-5" />
				<p>
					This is a preview. The post is not publicly visible and changes may occur before
					publication.
				</p>
			</div>
		</div>

		<!-- Table of Contents Sidebar -->
		{#if toc.length > 0}
			<TableOfContents {toc} {activeHeadingId} />
		{/if}
	</div>

	<MobileArticleNav title={post.title} {toc} {activeHeadingId} />
{:else}
	<div
		class="relative mx-auto flex max-w-screen-xl px-4 py-8 text-center text-lg text-muted-foreground"
	>
		<p>Preview not found. Please check the URL.</p>
	</div>
{/if}

<style>
	.preview-banner {
		position: sticky;
		top: 0;
		z-index: 50;
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15));
		border-bottom: 1px solid rgba(251, 191, 36, 0.3);
		padding: 1rem 1.5rem;
		backdrop-filter: blur(12px);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.preview-banner-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		min-width: 0;
	}

	.preview-banner-content :global(svg) {
		color: rgb(251, 191, 36);
		flex-shrink: 0;
	}

	.preview-banner-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.preview-banner-text strong {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-main);
	}

	.preview-banner-text span {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.preview-status {
		padding: 0.375rem 0.75rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.preview-status.draft {
		background: rgba(148, 163, 184, 0.2);
		color: rgb(148, 163, 184);
		border: 1px solid rgba(148, 163, 184, 0.4);
	}

	.preview-status.scheduled {
		background: rgba(59, 130, 246, 0.2);
		color: rgb(59, 130, 246);
		border: 1px solid rgba(59, 130, 246, 0.4);
	}

	.preview-notice {
		margin-top: 3rem;
		padding: 1.25rem 1.5rem;
		background: rgba(251, 191, 36, 0.1);
		border: 1px solid rgba(251, 191, 36, 0.3);
		border-radius: 0.75rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.preview-notice :global(svg) {
		color: rgb(251, 191, 36);
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.preview-notice p {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	.category-link {
		color: var(--text-muted);
		transition: color 150ms;
	}

	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: var(--tag-bg);
		border: 1px solid rgba(148, 163, 184, 0.4);
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.preview-banner {
			padding: 0.875rem 1rem;
			flex-direction: column;
			align-items: flex-start;
		}

		.preview-banner-content {
			width: 100%;
		}

		.preview-banner-text span {
			font-size: 0.75rem;
		}
	}
</style>
