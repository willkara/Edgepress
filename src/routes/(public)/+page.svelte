<script lang="ts">
	import { formatDateRelative } from '$lib/utils/date';
	import type { PageData } from './$types';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte'; // Import SpotlightCard

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>EdgePress - Blog at the Edge</title>
	<meta name="description" content="A serverless blog platform powered by Cloudflare" />
</svelte:head>

<section class="hero">
	<div class="hero-title">EdgePress</div>
	<p class="hero-subtitle">
		Blog at the edge. Serverless, markdown-first, and deployed where it matters.
	</p>
	<div class="hero-actions">
		<!-- Ideally this links to an intro post, but we'll link to the first post if available, or just home -->
		{#if data.posts.length > 0}
			<a href="/blog/{data.posts[0].slug}" class="button-primary"> Read latest </a>
		{:else}
			<a href="/" class="button-primary"> Read the intro </a>
		{/if}
		<a href="https://github.com" class="button-ghost" target="_blank" rel="noopener noreferrer">
			View on GitHub
		</a>
	</div>
</section>

<h2 class="posts-heading">Latest posts</h2>

{#if data.posts.length === 0}
	<div class="post-card" style="text-align: center; padding: 3rem;">
		<p class="post-excerpt">No posts published yet. Check back soon!</p>
	</div>
{:else}
	{#each data.posts as post}
		<SpotlightCard>
			<article class="post-card">
				<div class="post-meta">
					{formatDateRelative(post.published_at)}
					{#if post.category_name}
						· <a href="/blog/category/{post.category_slug}" class="category-link">{post.category_name}</a>
					{/if}
					{#if post.reading_time}
						· {post.reading_time} min read
					{/if}
				</div>
				<h3 class="post-title">
					<a href="/blog/{post.slug}">
						{post.title}
					</a>
				</h3>
				{#if post.excerpt}
					<p class="post-excerpt">
						{post.excerpt}
					</p>
				{/if}
			</article>
		</SpotlightCard>
	{/each}
{/if}

<style>
	.category-link {
		color: var(--text-subtle);
		text-decoration: none;
		transition: color 150ms;
	}

	.category-link:hover {
		color: var(--accent);
	}
</style>
