<script lang="ts">
	/**
	 * PostList Component
	 *
	 * Displays a list of blog posts with pagination.
	 * Used for:
	 * - Blog index (/blog)
	 * - Category archives (/blog/category/:slug)
	 * - Tag archives (/blog/tag/:slug)
	 * - Search results (/search)
	 */

	import { formatDateRelative } from '$lib/utils/date';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { ArrowLeft } from 'lucide-svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import type { PostListProps } from '$lib/themes/contracts';

	// Props from theme contract
	let { posts, pagination, context, themeConfig, themeOptions }: PostListProps = $props();

	// Build breadcrumbs based on context
	const breadcrumbItems = context
		? context.type === 'category'
			? [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: context.label }]
			: context.type === 'tag'
				? [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: context.label }]
				: context.type === 'search'
					? [{ label: 'Home', href: '/' }, { label: 'Search Results' }]
					: [{ label: 'Home', href: '/' }, { label: 'Blog' }]
		: [{ label: 'Home', href: '/' }, { label: 'Blog' }];

	// Get theme options
	const showReadTime = themeOptions?.showReadTime ?? true;
</script>

<div class="blog-page">
	<!-- Back Link -->
	<a href="/" class="back-link">
		<ArrowLeft class="w-4 h-4" />
		Back to home
	</a>

	<Breadcrumbs items={breadcrumbItems} />

	<!-- Page Header -->
	<div class="page-header">
		<h1 class="page-title">{context?.label || 'All Posts'}</h1>
		{#if context?.description}
			<p class="page-description">{context.description}</p>
		{/if}
		<p class="page-subtitle">
			{pagination.total}
			{pagination.total === 1 ? 'post' : 'posts'} published
		</p>
	</div>

	<!-- Posts List -->
	{#if posts.length === 0}
		<div class="empty-state">
			<p>No posts published yet. Check back soon!</p>
		</div>
	{:else}
		<div class="posts-list">
			{#each posts as post}
				<SpotlightCard>
					<article class="post-card">
						<div class="post-meta">
							{formatDateRelative(post.published_at)}
							{#if post.categories.length > 0}
								· <a href="/blog/category/{post.categories[0].slug}" class="category-link">
									{post.categories[0].name}
								</a>
							{/if}
							{#if showReadTime && post.read_time}
								· {post.read_time} min read
							{/if}
						</div>
						<h2 class="post-title">
							<a href="/blog/{post.slug}">
								{post.title}
							</a>
						</h2>
						{#if post.excerpt}
							<p class="post-excerpt">
								{post.excerpt}
							</p>
						{/if}
					</article>
				</SpotlightCard>
			{/each}
		</div>

		<!-- Pagination (if needed) -->
		{#if pagination.hasMore || pagination.offset > 0}
			<div class="pagination">
				{#if pagination.offset > 0}
					<a href="?offset={Math.max(0, pagination.offset - pagination.limit)}" class="pagination-btn">
						Previous
					</a>
				{/if}
				{#if pagination.hasMore}
					<a href="?offset={pagination.offset + pagination.limit}" class="pagination-btn">
						Next
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.blog-page {
		max-width: 48rem;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-subtle);
		text-decoration: none;
		margin-bottom: 2rem;
		transition: color 150ms;
	}

	.back-link:hover {
		color: var(--accent);
	}

	.page-header {
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0 0 0.5rem;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.page-description {
		font-size: 1rem;
		color: var(--text-muted);
		margin: 0 0 0.5rem;
	}

	.page-subtitle {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
	}

	.posts-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.post-card {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 1.2rem 1.4rem;
		display: block;
		text-decoration: none;
	}

	.post-meta {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-subtle);
		margin-bottom: 0.3rem;
	}

	.category-link {
		color: var(--text-subtle);
		text-decoration: none;
		transition: color 150ms;
	}

	.category-link:hover {
		color: var(--accent);
	}

	.post-title {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		font-weight: 600;
	}

	.post-title a {
		color: var(--text-main);
		text-decoration: none;
		transition: color 150ms;
	}

	.post-title a:hover {
		color: var(--accent);
	}

	.post-excerpt {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin: 0;
		line-height: 1.6;
	}

	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
	}

	.empty-state p {
		font-size: 1rem;
		color: var(--text-muted);
	}

	.pagination {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 3rem;
	}

	.pagination-btn {
		padding: 0.75rem 1.5rem;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		color: var(--text-main);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 150ms;
	}

	.pagination-btn:hover {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}

	@media (max-width: 768px) {
		.page-title {
			font-size: 1.5rem;
		}
	}
</style>
