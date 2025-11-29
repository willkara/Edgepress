<script lang="ts">
	import type { PageData } from './$types';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { formatDateRelative } from '$lib/utils/date';

	let { data }: { data: PageData } = $props();

	// Combine featured and non-featured projects if showAll is enabled
	const projects = $derived(() => {
		if (!data.showAll) {
			return data.featuredProjects;
		}

		// Get featured post IDs
		const featuredPostIds = new Set(data.featuredProjects.map((p) => p.post_id));

		// Combine featured (ordered first) with non-featured
		const featuredMapped = data.featuredProjects.map((fp) => ({
			id: fp.post_id,
			title: fp.post_title,
			slug: fp.post_slug,
			excerpt: fp.custom_description || fp.post_excerpt,
			hero_image_id: fp.post_hero_image_id,
			published_at: fp.post_published_at,
			category_name: fp.category_name,
			tags: fp.tags,
			is_featured: true
		}));

		const nonFeatured = data.allProjectPosts
			.filter((post) => !featuredPostIds.has(post.id))
			.map((post) => ({
				...post,
				is_featured: false,
				tags: [] // We don't have tags in the basic post query
			}));

		return [...featuredMapped, ...nonFeatured];
	})();
</script>

<svelte:head>
	<title>{data.settings.pageTitle} - EdgePress</title>
	<meta name="description" content={data.settings.pageSubtitle} />
</svelte:head>

<div class="projects-page">
	<!-- Hero Section -->
	<section class="hero">
		<h1 class="hero-title">{data.settings.pageTitle}</h1>
		<p class="hero-subtitle">{data.settings.pageSubtitle}</p>
	</section>

	<!-- Projects Grid -->
	{#if projects.length === 0}
		<div class="empty-state">
			<p>No projects yet. Check back soon!</p>
		</div>
	{:else}
		<div class="projects-grid">
			{#each projects as project}
				<SpotlightCard>
					<a href="/blog/{project.slug}" class="project-card">
						{#if project.hero_image_id}
							<div class="project-image">
								<img
									src="https://imagedelivery.net/YOUR_CF_ACCOUNT_HASH/{project.hero_image_id}/public"
									alt={project.title}
									loading="lazy"
								/>
							</div>
						{/if}

						<div class="project-content">
							<div class="project-header">
								<h2 class="project-title">{project.title}</h2>
								{#if project.is_featured}
									<span class="featured-badge">Featured</span>
								{/if}
							</div>

							{#if project.excerpt}
								<p class="project-excerpt">{project.excerpt}</p>
							{/if}

							{#if project.tags && project.tags.length > 0}
								<div class="project-tags">
									{#each project.tags.slice(0, 3) as tag}
										<span class="tag">{tag}</span>
									{/each}
									{#if project.tags.length > 3}
										<span class="tag">+{project.tags.length - 3}</span>
									{/if}
								</div>
							{/if}

							<div class="project-meta">
								{#if project.category_name}
									<span>{project.category_name}</span>
									<span>·</span>
								{/if}
								<span>{formatDateRelative(project.published_at)}</span>
							</div>
						</div>
					</a>
				</SpotlightCard>
			{/each}
		</div>
	{/if}
</div>

<style>
	.projects-page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--text-muted);
		max-width: 42rem;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
			transform 150ms ease,
			box-shadow 150ms ease,
			border-color 150ms ease;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-soft);
		border-color: rgba(148, 163, 184, 0.8);
	}

	.project-image {
		width: 100%;
		height: 200px;
		background: var(--bg-soft);
		overflow: hidden;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 200ms ease;
	}

	.project-card:hover .project-image img {
		transform: scale(1.05);
	}

	.project-content {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.project-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.project-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		line-height: 1.3;
		flex: 1;
	}

	.featured-badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: linear-gradient(to right, var(--accent-strong), var(--accent));
		color: #0f172a;
		font-weight: 600;
		white-space: nowrap;
	}

	.project-excerpt {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: var(--tag-bg);
		border: 1px solid rgba(148, 163, 184, 0.4);
		color: var(--text-muted);
	}

	.project-meta {
		font-size: 0.8rem;
		color: var(--text-subtle);
		margin-top: auto;
		display: flex;
		gap: 0.5rem;
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

		.projects-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
