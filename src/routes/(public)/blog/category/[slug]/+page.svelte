<script lang="ts">
	import type { PageData } from './$types';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { formatDateRelative } from '$lib/utils/date';
	import { ArrowLeft, Folder } from 'lucide-svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data }: { data: PageData } = $props();

	const breadcrumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Blog', href: '/blog' },
		{ label: data.category.name }
	];
</script>

<svelte:head>
	<title>{data.category.name} - EdgePress</title>
	<meta name="description" content="Browse all posts in the {data.category.name} category" />
</svelte:head>

<div class="category-archive">
	<!-- Back Link -->
	<a href="/" class="back-link">
		<ArrowLeft class="w-4 h-4" />
		Back to home
	</a>

	<Breadcrumbs items={breadcrumbItems} />

	<!-- Category Header -->
	<div class="category-header">
		<div class="category-icon">
			<Folder class="w-8 h-8 text-accent" />
		</div>
		<div>
			<h1 class="category-title">{data.category.name}</h1>
			<p class="category-meta">
				{data.posts.length} {data.posts.length === 1 ? 'post' : 'posts'}
			</p>
		</div>
	</div>

	<!-- Posts List -->
	{#if data.posts.length === 0}
		<div class="empty-state">
			<p>No posts in this category yet.</p>
		</div>
	{:else}
		<div class="posts-list">
			{#each data.posts as post}
				<SpotlightCard>
					<article class="post-card">
						<div class="post-meta">
							{formatDateRelative(post.published_at)}
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
	.category-archive {
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

	.category-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.category-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 0.75rem;
		background: var(--accent-soft);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
	}

	.category-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.category-meta {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0.25rem 0 0;
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
		.category-title {
			font-size: 1.5rem;
		}

		.category-icon {
			width: 2.5rem;
			height: 2.5rem;
		}
	}
</style>
