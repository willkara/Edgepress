<script lang="ts">
	import type { PageData } from './$types';
import SpotlightCard from '$lib/components/SpotlightCard.svelte';
import PopularPosts from '$lib/components/PopularPosts.svelte';
import { formatDateRelative } from '$lib/utils/date';
import { ArrowRight, Folder, BookOpen } from 'lucide-svelte';

let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>EdgePress - Blog at the Edge</title>
	<meta name="description" content="A serverless blog platform powered by Cloudflare" />
</svelte:head>

<!-- Hero Section -->
<section class="hero">
	<div class="hero-content">
		<h1 class="hero-title">Hi, I'm EdgePress 👋</h1>
		<p class="hero-subtitle">
			Welcome to my corner of the internet. I write about technology, build projects, and share what
			I learn along the way. This blog is built with SvelteKit and deployed on Cloudflare's edge
			network.
		</p>
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
	</div>
</section>

<!-- Featured Projects -->
{#if data.featuredProjects.length > 0}
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">Featured Projects</h2>
			<a href="/projects" class="section-link">
				View all
				<ArrowRight class="w-4 h-4" />
			</a>
		</div>

		<div class="projects-grid">
			{#each data.featuredProjects as project}
				<SpotlightCard>
					<!-- Use ProjectCard component logic here eventually, but keep existing style for now -->
					<a href="/projects" class="project-card">
						{#if project.hero_image_id}
							<div class="project-image">
								<img
									src="/cdn-cgi/imagedelivery/{data.imageHash}/{project.hero_image_id}/public"
									alt={project.title}
									loading="lazy"
								/>
							</div>
						{/if}

						<div class="project-content">
							<h3 class="project-title">{project.title}</h3>
							<p class="project-excerpt">
								{project.description}
							</p>

							{#if project.tech_stack && project.tech_stack.length > 0}
								<div class="project-tags">
									{#each project.tech_stack.slice(0, 3) as tech}
										<span class="tag">{tech}</span>
									{/each}
								</div>
							{/if}
						</div>
					</a>
				</SpotlightCard>
			{/each}
		</div>
	</section>
{/if}

<!-- Latest Posts -->
<section class="section">
	<div class="section-header">
		<h2 class="section-title">Latest Writing</h2>
		<a href="/blog" class="section-link">
			View all
			<ArrowRight class="w-4 h-4" />
		</a>
	</div>

	{#if data.latestPosts.length === 0}
		<div class="empty-state">
			<p>No posts published yet. Check back soon!</p>
		</div>
	{:else}
		<div class="posts-list">
			{#each data.latestPosts as post}
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
		</div>
	{/if}
</section>

<!-- Categories and Popular Posts Section -->
<section class="section">
	<div class="content-grid">
		<!-- Categories Grid -->
		{#if data.categories.length > 0}
			<div class="categories-section">
				<h2 class="section-title">Browse by Category</h2>

				<div class="categories-grid">
					{#each data.categories as category}
						<a href="/blog/category/{category.slug}" class="category-card">
							<div class="category-icon">
								<Folder class="w-6 h-6" />
							</div>
							<div class="category-info">
								<h3 class="category-name">{category.name}</h3>
								<p class="category-count">
									{category.post_count || 0}
									{category.post_count === 1 ? 'post' : 'posts'}
								</p>
							</div>
							<span class="category-arrow" aria-hidden="true">
								<ArrowRight />
							</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Popular Posts Widget -->
		{#if data.popularPosts && data.popularPosts.length > 0}
			<div class="popular-section">
				<PopularPosts posts={data.popularPosts} />
			</div>
		{/if}
	</div>
</section>

<style>
	/* Hero Section */
	.hero {
		margin-bottom: 4rem;
		padding: 3rem 0;
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

	/* Projects Grid */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.project-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		overflow: hidden;
		text-decoration: none;
		transition:
			transform 150ms,
			box-shadow 150ms;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-soft);
	}

	.project-image {
		width: 100%;
		height: 180px;
		background: var(--bg-soft);
		overflow: hidden;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.project-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		margin: 0 0 0.75rem;
	}

	.project-excerpt {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: var(--tag-bg);
		border: 1px solid rgba(148, 163, 184, 0.4);
		color: var(--text-muted);
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

	/* Content Grid - Two Column Layout */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr 350px;
		}
	}

	.categories-section {
		min-width: 0;
	}

	.popular-section {
		min-width: 0;
	}

	/* Categories Grid */
	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.category-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		text-decoration: none;
		transition: all 150ms;
	}

	.category-card:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
		box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.1);
	}

	.category-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
		background: var(--accent-soft);
		color: var(--accent);
		flex-shrink: 0;
	}

	.category-info {
		flex: 1;
		min-width: 0;
	}

	.category-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 0.25rem;
	}

	.category-count {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
	}

	.category-arrow {
		display: inline-flex;
		color: var(--text-subtle);
		flex-shrink: 0;
		transition: transform 150ms;
		width: 1.25rem;
		height: 1.25rem;
	}

	.category-arrow :global(svg) {
		width: 100%;
		height: 100%;
	}

	.category-card:hover .category-arrow {
		transform: translateX(4px);
		color: var(--accent);
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

		.projects-grid,
		.categories-grid {
			grid-template-columns: 1fr;
		}

		.section-title {
			font-size: 1.25rem;
		}
	}
</style>
