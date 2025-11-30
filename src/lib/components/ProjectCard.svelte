<script lang="ts">
        import CloudflareImage from '$lib/components/CloudflareImage.svelte';
        import SpotlightCard from '$lib/components/SpotlightCard.svelte';
        import { formatDateRelative } from '$lib/utils/date';

        export interface ProjectDisplay {
                title: string;
                slug: string;
                summary: string | null;
                tech_stack?: string[];
                repo_url?: string | null;
                live_url?: string | null;
                hero_image_id?: string | null;
                status?: string;
                post_slug?: string;
                post_title?: string;
                post_published_at?: string;
        }

        let { project }: { project: ProjectDisplay } = $props();
</script>

<SpotlightCard>
        <article class="project-card">
                {#if project.hero_image_id}
                        <div class="project-image">
                                <CloudflareImage imageId={project.hero_image_id} alt={project.title} variant="public" />
                        </div>
                {/if}

                <div class="project-content">
                        <div class="project-header">
                                <div>
                                        <h2 class="project-title">{project.title}</h2>
                                        {#if project.summary}
                                                <p class="project-summary">{project.summary}</p>
                                        {/if}
                                </div>
                                {#if project.status}
                                        <span class="status-badge">{project.status}</span>
                                {/if}
                        </div>

                        {#if project.tech_stack && project.tech_stack.length > 0}
                                <div class="tech-stack">
                                        {#each project.tech_stack as tech}
                                                <span class="chip">{tech}</span>
                                        {/each}
                                </div>
                        {/if}

                        <div class="project-links">
                                {#if project.repo_url}
                                        <a class="link" href={project.repo_url} target="_blank" rel="noreferrer">View repo</a>
                                {/if}
                                {#if project.live_url}
                                        <a class="link" href={project.live_url} target="_blank" rel="noreferrer">Live demo</a>
                                {/if}
                                {#if project.post_slug}
                                        <a class="link" href={`/blog/${project.post_slug}`}>
                                                {project.post_title ? `Read: ${project.post_title}` : 'Related post'}
                                        </a>
                                {/if}
                        </div>

                        {#if project.post_published_at}
                                <p class="meta">Updated {formatDateRelative(project.post_published_at)}</p>
                        {/if}
                </div>
        </article>
</SpotlightCard>

<style>
        .project-card {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                height: 100%;
        }

        .project-image :global(img) {
                width: 100%;
                height: 220px;
                object-fit: cover;
        }

        .project-content {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                padding: 0.75rem 0.25rem 0.25rem 0.25rem;
        }

        .project-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 0.75rem;
        }

        .project-title {
                font-size: 1.2rem;
                font-weight: 700;
                margin: 0;
        }

        .project-summary {
                margin-top: 0.35rem;
                color: var(--text-muted);
                line-height: 1.6;
        }

        .status-badge {
                align-self: flex-start;
                background: var(--bg-soft);
                border: 1px solid var(--border-subtle);
                border-radius: 999px;
                padding: 0.25rem 0.75rem;
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--text-subtle);
                text-transform: capitalize;
        }

        .tech-stack {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
        }

        .chip {
                background: var(--tag-bg);
                border: 1px solid rgba(148, 163, 184, 0.4);
                color: var(--text-muted);
                padding: 0.35rem 0.6rem;
                border-radius: 999px;
                font-size: 0.85rem;
        }

        .project-links {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-top: 0.25rem;
        }

        .link {
                color: var(--accent);
                font-weight: 600;
                text-decoration: none;
        }

        .link:hover {
                text-decoration: underline;
        }

        .meta {
                color: var(--text-subtle);
                font-size: 0.85rem;
                margin: 0.25rem 0 0 0;
        }
</style>
