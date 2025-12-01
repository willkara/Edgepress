<script lang="ts">
	import { formatDateRelative } from '$lib/utils/date';
	import type { PageData } from './$types';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { ArrowLeft } from 'lucide-svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
import { navigating } from '$app/stores';

let { data }: { data: PageData } = $props();

const navigatingStore = $derived(navigating);
const isLoading = $derived(Boolean(navigatingStore));

	const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Blog' }];
</script>

<svelte:head>
	<title>Blog - EdgePress</title>
	<meta name="description" content="All blog posts from EdgePress" />
</svelte:head>

<div class="blog-page">
	<!-- Back Link -->
	<a href="/" class="back-link">
		<ArrowLeft class="w-4 h-4" />
		Back to home
	</a>

	<Breadcrumbs items={breadcrumbItems} />

	<!-- Page Header -->
	<div class="page-header">
		<h1 class="page-title">All Posts</h1>
		<p class="page-subtitle">
			{data.posts.length}
			{data.posts.length === 1 ? 'post' : 'posts'} published
		</p>
	</div>

	<!-- Posts List -->
	{#if isLoading}
		<div class="posts-list">
			{#each Array(5) as _, i}
				<SkeletonCard />
			{/each}
		</div>
	{:else if data.posts.length === 0}
		<div class="empty-state">
			<p>No posts published yet. Check back soon!</p>
		</div>
	{:else}
		<div class="posts-list">
			{#each data.posts as post}
				<SpotlightCard>
					<article class="post-card">
						<div class="post-meta">
							{formatDateRelative(post.published_at)}
							{#if post.category_name}
								· <a href="/blog/category/{post.category_slug}" class="category-link">
									{post.category_name}
								</a>
							{/if}
							{#if post.reading_time}
								· {post.reading_time} min read
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

	@media (max-width: 768px) {
		.page-title {
			font-size: 1.5rem;
		}
	}
</style>
