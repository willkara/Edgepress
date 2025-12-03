<script lang="ts">
	/**
	 * PostSingle Component
	 *
	 * Displays a single blog post with all its metadata, content, and related features.
	 * Includes:
	 * - Post header (title, metadata, tags)
	 * - Hero image (if present)
	 * - Table of contents (for longer posts)
	 * - Post content with syntax highlighting
	 * - Reading progress bar
	 * - Post reactions (likes, hearts, bookmarks)
	 * - Related posts
	 * - Newsletter signup
	 */

	import { formatDateStandard } from '$lib/utils/date';
	import DOMPurify from 'isomorphic-dompurify';
	import ReadingProgressBar from '$lib/components/ReadingProgressBar.svelte';
	import { extractToc, type TocItem } from '$lib/utils/toc';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import ViewCounter from '$lib/components/ViewCounter.svelte';
	import MobileArticleNav from '$lib/components/MobileArticleNav.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import RelatedPosts from '$lib/components/RelatedPosts.svelte';
	import CopyCodeButton from '$lib/components/CopyCodeButton.svelte';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import PostReactions from '$lib/components/PostReactions.svelte';
	import ContinueReadingBanner from '$lib/components/ContinueReadingBanner.svelte';
	import type { PostSingleProps } from '$lib/themes/contracts';

	// Props from theme contract
	let { post, relatedPosts, themeConfig, themeOptions }: PostSingleProps = $props();

	// Calculate word count from content
	const wordCount = post.content_html
		? post.content_html.split(/\s+/).filter((word) => word.length > 0).length
		: 0;

	// Build breadcrumbs
	const breadcrumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Blog', href: '/blog' },
		// Add first category if available
		...(post.categories.length > 0
			? [{ label: post.categories[0].name, href: `/blog/category/${post.categories[0].slug}` }]
			: []),
		{ label: post.title }
	];

	// State for table of contents
	let toc = $state<TocItem[]>([]);
	let sanitizedContent = $state('');
	let activeHeadingId = $state('');
	let observer: IntersectionObserver | undefined;

	// Extract TOC and sanitize content
	$effect(() => {
		const { toc: extractedToc, html: modifiedHtml } = extractToc(post.content_html);
		toc = extractedToc;
		sanitizedContent = DOMPurify.sanitize(modifiedHtml);

		// Set up intersection observer for TOC active state
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

	// Get theme option for showing related posts
	const showRelatedPosts = themeOptions?.showRelatedPosts ?? true;
	const showReadTime = themeOptions?.showReadTime ?? true;
	const showAuthor = themeOptions?.showAuthor ?? true;
</script>

<ReadingProgressBar postSlug={post.slug} {wordCount} />
<ContinueReadingBanner postSlug={post.slug} />

<div class="relative mx-auto flex max-w-screen-xl px-4 py-8 gap-8">
	<!-- Main Article Content -->
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
				{#if showAuthor}
					<span>By {post.author_name}</span>
				{/if}
				<span>on {formatDateStandard(post.published_at)}</span>
				{#if post.updated_at && post.updated_at !== post.published_at}
					<span>· Updated {formatDateStandard(post.updated_at)}</span>
				{/if}
				{#if post.categories.length > 0}
					<span
						>· <a href="/blog/category/{post.categories[0].slug}" class="category-link"
							>{post.categories[0].name}</a
						></span
					>
				{/if}
				{#if showReadTime && post.read_time}
					<span>· {post.read_time} min read</span>
				{/if}
				<span>·</span>
				<ViewCounter slug={post.slug} initialViews={0} />
			</div>
			<h1 class="article-title">{post.title}</h1>

			{#if post.excerpt}
				<p class="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
			{/if}

			{#if post.tags && post.tags.length > 0}
				<div class="article-tags">
					{#each post.tags as tag}
						<a href="/blog/tag/{tag.slug}" class="tag">
							{tag.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div class="article-body">
			{@html sanitizedContent}
			<CopyCodeButton />
		</div>

		<!-- Post Reactions -->
		<PostReactions postId={post.id} initialLikes={0} initialHearts={0} initialBookmarks={0} />

		<!-- Related Posts -->
		{#if showRelatedPosts && relatedPosts && relatedPosts.length > 0}
			<RelatedPosts posts={relatedPosts} />
		{/if}

		<!-- Newsletter Signup -->
		<NewsletterSignup />
	</div>

	<!-- Table of Contents Sidebar -->
	{#if toc.length > 1 && wordCount > 300}
		<TableOfContents {toc} {activeHeadingId} />
	{/if}
</div>

<MobileArticleNav title={post.title} {toc} {activeHeadingId} />

<style>
	.category-link {
		color: var(--text-muted);
		text-decoration: none;
		transition: color 150ms;
	}

	.category-link:hover {
		color: var(--accent);
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
		text-decoration: none;
		transition: all 150ms;
	}

	.tag:hover {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
