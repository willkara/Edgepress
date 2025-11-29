<script lang="ts">
	import type { Post } from '$lib/server/db/posts';
	import { TrendingUp, Eye } from 'lucide-svelte';

	let { posts }: { posts: Post[] } = $props();
</script>

{#if posts.length > 0}
	<aside class="popular-posts">
		<div class="header">
			<TrendingUp class="header-icon" />
			<h3 class="header-title">Popular Posts</h3>
		</div>

		<ul class="posts-list">
			{#each posts as post, index}
				<li class="post-item">
					<a href="/blog/{post.slug}" class="post-link">
						<div class="post-rank">{index + 1}</div>
						<div class="post-content">
							<h4 class="post-title">{post.title}</h4>
							<div class="post-meta">
								<Eye class="meta-icon" />
								<span>{post.view_count.toLocaleString()} views</span>
								{#if post.reading_time}
									<span>· {post.reading_time} min</span>
								{/if}
							</div>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</aside>
{/if}

<style>
	.popular-posts {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 1.5rem;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.header-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--accent);
	}

	.header-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.posts-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.post-item {
		margin: 0;
		padding: 0;
	}

	.post-link {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 0.75rem;
		border-radius: 0.5rem;
		text-decoration: none;
		transition: background 150ms;
	}

	.post-link:hover {
		background: var(--bg-soft);
	}

	.post-rank {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.875rem;
		font-weight: 600;
		font-family: 'Space Grotesk', system-ui, sans-serif;
	}

	.post-content {
		flex: 1;
		min-width: 0;
	}

	.post-title {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text-main);
		margin: 0 0 0.5rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		transition: color 150ms;
	}

	.post-link:hover .post-title {
		color: var(--accent);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--text-subtle);
	}

	.meta-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	@media (max-width: 768px) {
		.popular-posts {
			padding: 1.25rem;
		}

		.post-rank {
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.8125rem;
		}

		.post-title {
			font-size: 0.9rem;
		}
	}
</style>
