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
	import RelatedPosts from '$lib/components/RelatedPosts.svelte';
	import CopyCodeButton from '$lib/components/CopyCodeButton.svelte';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import PostReactions from '$lib/components/PostReactions.svelte';
	import ContinueReadingBanner from '$lib/components/ContinueReadingBanner.svelte';

	let { data }: { data: PageData } = $props();
	const post = data.post; // post can be null here

	// Calculate word count from markdown content
	const wordCount = post?.content_md
		? post.content_md.split(/\s+/).filter((word) => word.length > 0).length
		: 0;

	// Build breadcrumbs
	const breadcrumbItems = post
		? [
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				...(post.category_name
					? [{ label: post.category_name, href: `/blog/category/${post.category_slug}` }]
					: []),
				{ label: post.title }
			]
		: [];

	// Initialize these outside if they need to be accessed conditionally later,
	// or only declare inside if branch if strictly used there.
	let toc = $state<TocItem[]>([]);
	let sanitizedContent = $state('');
	let activeHeadingId = $state(''); // Declare here to be available for conditional rendering

	let observer: IntersectionObserver | undefined; // Make observer optional

	// Effect runs only if post is available, and disconnects if it disappears
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
			observer = undefined; // Clear observer on cleanup
		};
	});
</script>

<svelte:head>
	<title>{post?.title || 'EdgePress'} - EdgePress</title>
	<meta
		name="description"
		content={post?.excerpt || post?.title || 'A serverless blog platform powered by Cloudflare'}
	/>
	<!-- Open Graph / Social Media Meta Tags -->
	<meta property="og:title" content={post?.title || 'EdgePress'} />
	<meta
		property="og:description"
		content={post?.excerpt || post?.title || 'A serverless blog platform powered by Cloudflare'}
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content={`https://yourdomain.com/blog/${post?.slug || ''}`} />
	{#if post?.hero_image_id}
		<meta
			property="og:image"
			content={`https://imagedelivery.net/YOUR_CF_ACCOUNT_HASH/${post.hero_image_id}/public`}
		/>
	{/if}
</svelte:head>

{#if post}
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
					<span>By {post.author_name} on {formatDateStandard(post.published_at)}</span>
					{#if post.updated_at && post.updated_at !== post.published_at}
						<span>· Updated {formatDateStandard(post.updated_at)}</span>
					{/if}
					{#if post.category_name}
						<span
							>· <a href="/blog/category/{post.category_slug}" class="category-link"
								>{post.category_name}</a
							></span
						>
					{/if}
					{#if post.reading_time}
						<span>· {post.reading_time} min read</span>
					{/if}
					<span>·</span>
					<ViewCounter slug={post.slug} initialViews={post.view_count || 0} />
				</div>
				<h1 class="article-title">{post.title}</h1>

				{#if post.excerpt}
					<p class="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
				{/if}

				{#if data.tags && data.tags.length > 0}
					<div class="article-tags">
						{#each data.tags as tag}
							<a href="/blog/tag/{tag.slug}" class="tag">
								{tag.name}
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<div class="article-body">
				<!-- eslint-disable svelte/no-at-html-tags -->
				<!-- eslint-disable svelte/no-at-html-tags -->
				<!-- eslint-disable svelte/no-at-html-tags -->
				<!-- eslint-disable svelte/no-at-html-tags -->
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html sanitizedContent}
				<CopyCodeButton />
			</div>

			<!-- Post Reactions -->
			<PostReactions
				postId={post.id}
				initialLikes={post.like_count || 0}
				initialHearts={post.heart_count || 0}
				initialBookmarks={post.bookmark_count || 0}
			/>

			<!-- Related Posts -->
			{#if data.relatedPosts && data.relatedPosts.length > 0}
				<RelatedPosts posts={data.relatedPosts} />
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
{:else}
	<!-- Fallback for when post is null -->
	<div
		class="relative mx-auto flex max-w-screen-xl px-4 py-8 text-center text-lg text-muted-foreground"
	>
		<p>Post not found. Please check the URL.</p>
	</div>
{/if}

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
