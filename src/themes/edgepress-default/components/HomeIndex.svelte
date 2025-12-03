<script lang="ts">
	/**
	 * HomeIndex Component
	 *
	 * Homepage template for the EdgePress Default Theme.
	 * Features:
	 * - Hero section with site introduction
	 * - Latest posts listing
	 * - Featured projects (optional)
	 * - Categories grid
	 * - Popular posts sidebar
	 */

	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { formatDateRelative } from '$lib/utils/date';
	import { ArrowRight, Folder, BookOpen } from 'lucide-svelte';
	import type { HomeIndexProps } from '$lib/themes/contracts';

	// Props from theme contract
	let { posts, hero, themeConfig, themeOptions }: HomeIndexProps = $props();
</script>

<!-- Hero Section -->
<section class="landing-hero">
	<div class="hero-content">
		<h1 class="hero-title">{hero?.title || 'Hi, I\'m EdgePress 👋'}</h1>
		<p class="hero-subtitle">
			{hero?.subtitle ||
				'Welcome to my corner of the internet. I write about technology, build projects, and share what I learn along the way.'}
		</p>
		{#if hero?.cta}
			<div class="hero-actions">
				<a href={hero.cta.href} class="button-primary">
					<BookOpen class="w-4 h-4" />
					{hero.cta.text}
				</a>
			</div>
		{:else}
			<div class="hero-actions">
				<a href="/blog" class="button-primary">
					<BookOpen class="w-4 h-4" />
					Read the Blog
				</a>
				<a href="/projects" class="button-ghost">
					<Folder class="w-4 h-4" />
					View Projects
				</a>
			</div>
		{/if}
	</div>
</section>

<!-- Latest Posts -->
<section class="section">
	<div class="section-header">
		<h2 class="section-title">Latest Writing</h2>
		<a href="/blog" class="section-link">
			View all
			<ArrowRight class="w-4 h-4" />
		</a>
	</div>

	{#if posts.length === 0}
		<div class="empty-state">
			<p>No posts published yet. Check back soon!</p>
		</div>
	{:else}
		<div class="posts-list">
			{#each posts as post}
				<SpotlightCard>
					<a href="/blog/{post.slug}" class="post-card">
						<div class="post-meta">
							{formatDateRelative(post.published_at)}
							{#if post.categories.length > 0}
								· <span class="category-link">
									{post.categories[0].name}
								</span>
							{/if}
							{#if post.read_time}
								· {post.read_time} min read
							{/if}
						</div>
						<h3 class="post-title">
							{post.title}
						</h3>
						{#if post.excerpt}
							<p class="post-excerpt">
								{post.excerpt}
							</p>
						{/if}
					</a>
				</SpotlightCard>
			{/each}
		</div>
	{/if}
</section>

<style>
	/* Hero Section */
	.landing-hero {
		margin-bottom: 4rem;
		padding: 5rem 0;
	}

	.hero-content {
		max-width: 42rem;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--text-muted);
		margin-bottom: 2rem;
		line-height: 1.7;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.button-primary,
	.button-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 150ms;
		cursor: pointer;
	}

	.button-primary {
		background: linear-gradient(to right, var(--accent-strong), var(--accent));
		color: #0f172a;
		box-shadow: 0 10px 28px rgba(var(--accent-rgb), 0.22);
	}

	.button-primary:hover {
		filter: brightness(1.05);
		box-shadow: 0 12px 34px rgba(var(--accent-rgb), 0.3);
		transform: translateY(-1px);
	}

	.button-ghost {
		border: 1px solid var(--border-subtle);
		color: var(--text-muted);
		background: rgba(15, 23, 42, 0.7);
	}

	.button-ghost:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: rgba(15, 23, 42, 0.9);
	}

	/* Section */
	.section {
		margin-bottom: 4rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		margin: 0;
	}

	.section-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--accent);
		text-decoration: none;
		transition: all 150ms;
	}

	.section-link:hover {
		gap: 0.75rem;
	}

	/* Posts List */
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
	}

	.post-title {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		font-weight: 600;
	}

	.post-card:hover .post-title {
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
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.section-title {
			font-size: 1.25rem;
		}
	}
</style>
