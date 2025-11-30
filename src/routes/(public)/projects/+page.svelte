<script lang="ts">
        import type { PageData } from './$types';
        import SpotlightCard from '$lib/components/SpotlightCard.svelte';
        import { formatDateRelative } from '$lib/utils/date';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import { goto } from '$app/navigation';
        import { navigating } from '$app/stores';
        import { ExternalLink, Github, Link2 } from 'lucide-svelte';

        let { data }: { data: PageData } = $props();

        let stackFilter = $state(data.filters.stack);
        let statusFilter = $state(data.filters.status);

        $effect(() => {
                stackFilter = data.filters.stack;
                statusFilter = data.filters.status;
        });

        const breadcrumbItems = [
                { label: 'Home', href: '/' },
                { label: 'Projects' }
        ];

        const isNavigating = $derived(!!$navigating);
        const skeletonCards = Array.from({ length: 6 });

        async function applyFilters() {
                const params = new URLSearchParams();

                if (stackFilter && stackFilter !== 'all') {
                        params.set('stack', stackFilter);
                }

                if (statusFilter && statusFilter !== 'all') {
                        params.set('status', statusFilter);
                }

                const query = params.toString();
                await goto(`/projects${query ? `?${query}` : ''}`, { keepFocus: true, noScroll: true });
        }
</script>

<svelte:head>
	<title>{data.settings.pageTitle} - EdgePress</title>
	<meta name="description" content={data.settings.pageSubtitle} />
</svelte:head>

<div class="projects-page">
	<Breadcrumbs items={breadcrumbItems} />

	<!-- Hero Section -->
        <section class="hero">
                <h1 class="hero-title">{data.settings.pageTitle}</h1>
                <p class="hero-subtitle">{data.settings.pageSubtitle}</p>
        </section>

        <section class="filters">
                <div class="filter-group">
                        <label for="tech-filter">Tech stack</label>
                        <div class="input-shell">
                                <select id="tech-filter" bind:value={stackFilter} onchange={applyFilters}>
                                        <option value="all">All stacks</option>
                                        {#each data.availableStacks as stack}
                                                <option value={stack}>{stack}</option>
                                        {/each}
                                </select>
                        </div>
                </div>

                <div class="filter-group">
                        <label for="status-filter">Status</label>
                        <div class="input-shell">
                                <select id="status-filter" bind:value={statusFilter} onchange={applyFilters}>
                                        {#each data.availableStatuses as status}
                                                <option value={status}>{status === 'all' ? 'All statuses' : status}</option>
                                        {/each}
                                </select>
                        </div>
                </div>
        </section>

        {#if data.error}
                <div class="state-card error">
                        <p>{data.error}</p>
                        <p class="hint">Try reloading or adjusting your filters.</p>
                </div>
        {/if}

        {#if isNavigating}
                <div class="projects-grid">
                        {#each skeletonCards as _}
                                <SpotlightCard>
                                        <div class="project-card skeleton" aria-hidden="true">
                                                <div class="project-image shimmer"></div>
                                                <div class="project-content">
                                                        <div class="skeleton-line wide"></div>
                                                        <div class="skeleton-line"></div>
                                                        <div class="skeleton-tags">
                                                                <span></span>
                                                                <span></span>
                                                                <span></span>
                                                        </div>
                                                        <div class="skeleton-meta"></div>
                                                </div>
                                        </div>
                                </SpotlightCard>
                        {/each}
                </div>
        {:else if data.projects.length === 0}
                <div class="state-card empty">
                        <p>No projects match these filters yet.</p>
                        <p class="hint">Clear filters or check back soon.</p>
                </div>
        {:else}
                <div class="projects-grid">
                        {#each data.projects as project}
                                <SpotlightCard>
                                        <div class="project-card">
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
                                                                <div>
                                                                        <h2 class="project-title">{project.title}</h2>
                                                                        <div class="project-meta">
                                                                                {#if project.category_name}
                                                                                        <span>{project.category_name}</span>
                                                                                        <span aria-hidden="true">·</span>
                                                                                {/if}
                                                                                <span>{formatDateRelative(project.published_at)}</span>
                                                                        </div>
                                                                </div>

                                                                <span class="status-badge" data-status={project.status}>
                                                                        {project.status}
                                                                </span>
                                                        </div>

                                                        {#if project.excerpt}
                                                                <p class="project-excerpt">{project.excerpt}</p>
                                                        {/if}

                                                        {#if project.tags && project.tags.length > 0}
                                                                <div class="project-tags">
                                                                        <span class="tags-label">
                                                                                <Link2 size={14} />
                                                                                Tech stack
                                                                        </span>
                                                                        <div class="tags-list">
                                                                                {#each project.tags.slice(0, 5) as tag}
                                                                                        <span class="tag">{tag}</span>
                                                                                {/each}
                                                                                {#if project.tags.length > 5}
                                                                                        <span class="tag">+{project.tags.length - 5}</span>
                                                                                {/if}
                                                                        </div>
                                                                </div>
                                                        {/if}

                                                        <div class="project-links">
                                                                {#if project.repoUrl}
                                                                        <a
                                                                                class="link-chip"
                                                                                href={project.repoUrl}
                                                                                target="_blank"
                                                                                rel="noreferrer noopener"
                                                                        >
                                                                                <Github size={16} />
                                                                                <span>Repository</span>
                                                                        </a>
                                                                {/if}
                                                                {#if project.liveUrl}
                                                                        <a
                                                                                class="link-chip"
                                                                                href={project.liveUrl}
                                                                                target={project.liveUrl.startsWith('http') ? '_blank' : '_self'}
                                                                                rel="noreferrer noopener"
                                                                        >
                                                                                <ExternalLink size={16} />
                                                                                <span>Live</span>
                                                                        </a>
                                                                {/if}
                                                                <a class="link-chip" href={`/blog/${project.slug}`}>
                                                                        <Link2 size={16} />
                                                                        <span>Read case study</span>
                                                                </a>
                                                        </div>
                                                </div>
                                        </div>
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

        .filters {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
        }

        .filter-group {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
        }

        .filter-group label {
                font-size: 0.9rem;
                color: var(--text-muted);
        }

        .input-shell {
                background: var(--bg-elevated);
                border: 1px solid var(--border-subtle);
                border-radius: 0.75rem;
                padding: 0.55rem 0.75rem;
        }

        select {
                width: 100%;
                background: transparent;
                border: none;
                color: var(--text-main);
                font-size: 0.95rem;
                outline: none;
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
                margin-bottom: 0.35rem;
        }

        .status-badge {
                font-size: 0.75rem;
                padding: 0.25rem 0.6rem;
                border-radius: 999px;
                background: var(--bg-soft);
                border: 1px solid var(--border-subtle);
                color: var(--text-muted);
                text-transform: capitalize;
        }

        .status-badge[data-status='featured'] {
                background: linear-gradient(to right, var(--accent-strong), var(--accent));
                color: #0f172a;
                border-color: transparent;
        }

        .status-badge[data-status='in-progress'] {
                background: rgba(250, 204, 21, 0.12);
                border-color: rgba(250, 204, 21, 0.35);
                color: #facc15;
        }

        .status-badge[data-status='archived'] {
                background: rgba(148, 163, 184, 0.15);
                border-color: rgba(148, 163, 184, 0.45);
                color: var(--text-muted);
        }

	.project-excerpt {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin-bottom: 1rem;
		line-height: 1.6;
	}

        .project-tags {
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
                margin-bottom: 1rem;
        }

        .tags-label {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                font-size: 0.8rem;
                color: var(--text-subtle);
        }

        .tags-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
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
                display: flex;
                gap: 0.5rem;
                align-items: center;
        }

        .project-links {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: auto;
        }

        .link-chip {
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                padding: 0.45rem 0.75rem;
                border-radius: 999px;
                border: 1px solid var(--border-subtle);
                color: var(--text-main);
                background: var(--bg-soft);
                text-decoration: none;
                font-size: 0.9rem;
                transition: background 150ms ease, transform 150ms ease, border-color 150ms ease;
        }

        .link-chip:hover {
                background: var(--bg-elevated);
                transform: translateY(-1px);
                border-color: rgba(148, 163, 184, 0.6);
        }

        .state-card {
                padding: 2rem;
                border-radius: 0.9rem;
                border: 1px solid var(--border-subtle);
                background: var(--bg-elevated);
                text-align: center;
                color: var(--text-main);
        }

        .state-card.empty {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02));
        }

        .state-card.error {
                background: linear-gradient(135deg, rgba(248, 113, 113, 0.1), rgba(248, 113, 113, 0.02));
        }

        .state-card .hint {
                margin-top: 0.35rem;
                color: var(--text-muted);
        }

        .skeleton {
                pointer-events: none;
        }

        .shimmer {
                position: relative;
                overflow: hidden;
        }

        .shimmer::after {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transform: translateX(-100%);
                animation: shimmer 1.4s infinite;
        }

        .skeleton-line {
                height: 12px;
                background: var(--bg-soft);
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                width: 80%;
        }

        .skeleton-line.wide {
                height: 18px;
                width: 90%;
                margin-bottom: 0.75rem;
        }

        .skeleton-tags {
                display: flex;
                gap: 0.5rem;
                margin: 0.6rem 0;
        }

        .skeleton-tags span {
                flex: 1;
                height: 10px;
                background: var(--bg-soft);
                border-radius: 999px;
        }

        .skeleton-meta {
                height: 10px;
                width: 50%;
                background: var(--bg-soft);
                border-radius: 999px;
        }

        @keyframes shimmer {
                from {
                        transform: translateX(-100%);
                }

                to {
                        transform: translateX(100%);
                }
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
