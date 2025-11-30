<script lang="ts">
	import type { Post } from '$lib/server/db/posts';
	import { formatDateRelative } from '$lib/utils/date';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { ArrowRight } from 'lucide-svelte';

	let { posts }: { posts: Post[] } = $props();
</script>

{#if posts.length > 0}
	<section class="related-posts">
		<div class="section-header">
			<h2 class="section-title">Related Articles</h2>
			<p class="section-subtitle">Continue exploring similar topics</p>
		</div>

		<div class="posts-grid">
			{#each posts as post}
				<SpotlightCard>
					<a href="/blog/{post.slug}" class="post-card">
						<div class="post-content">
							<div class="post-meta">
								{formatDateRelative(post.published_at)}
								{#if post.category_name}
									· {post.category_name}
								{/if}
								{#if post.reading_time}
									· {post.reading_time} min read
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

                                                        <div class="read-more">
                                                                <span>Read article</span>
                                                                <span class="arrow-icon" aria-hidden="true">
                                                                        <ArrowRight />
                                                                </span>
                                                        </div>
						</div>
					</a>
				</SpotlightCard>
			{/each}
		</div>
	</section>
{/if}

<style>
	.related-posts {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border-subtle);
	}

	.section-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0 0 0.5rem;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.section-subtitle {
		font-size: 0.95rem;
		color: var(--text-muted);
		margin: 0;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.post-card {
		display: block;
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 1.5rem;
		text-decoration: none;
		transition: all 150ms ease;
		height: 100%;
	}

	.post-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.post-meta {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-subtle);
		margin-bottom: 0.75rem;
	}

	.post-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0 0 0.75rem;
		line-height: 1.4;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		transition: color 150ms;
	}

	.post-card:hover .post-title {
		color: var(--accent);
	}

        .post-excerpt {
                font-size: 0.9rem;
                color: var(--text-muted);
                margin: 0 0 1rem;
                line-height: 1.6;
                flex: 1;
                display: -webkit-box;
                line-clamp: 3;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
        }

	.read-more {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--accent);
		margin-top: auto;
	}

        .arrow-icon {
                display: inline-flex;
                width: 1rem;
                height: 1rem;
                transition: transform 150ms;
        }

        .arrow-icon :global(svg) {
                width: 100%;
                height: 100%;
        }

	.post-card:hover .arrow-icon {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.section-title {
			font-size: 1.5rem;
		}

		.posts-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
