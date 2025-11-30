<script lang="ts">
	import { List, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let {
		seriesName,
		seriesSlug,
		currentOrder,
		totalPosts,
		previousPost,
		nextPost
	}: {
		seriesName: string;
		seriesSlug: string;
		currentOrder: number;
		totalPosts: number;
		previousPost?: { slug: string; title: string } | null;
		nextPost?: { slug: string; title: string } | null;
	} = $props();
</script>

<aside class="post-series">
	<div class="series-header">
		<List class="series-icon" />
		<div>
			<div class="series-badge">Part {currentOrder} of {totalPosts}</div>
			<h4 class="series-title">
				<a href="/series/{seriesSlug}">{seriesName}</a>
			</h4>
		</div>
	</div>

	<div class="series-nav">
		{#if previousPost}
			<a href="/blog/{previousPost.slug}" class="series-link prev">
				<ChevronLeft class="link-icon" />
				<div class="link-content">
					<span class="link-label">Previous</span>
					<span class="link-title">{previousPost.title}</span>
				</div>
			</a>
		{:else}
			<div class="series-link disabled">
				<span class="link-label">First in series</span>
			</div>
		{/if}

		{#if nextPost}
			<a href="/blog/{nextPost.slug}" class="series-link next">
				<div class="link-content">
					<span class="link-label">Next</span>
					<span class="link-title">{nextPost.title}</span>
				</div>
				<ChevronRight class="link-icon" />
			</a>
		{:else}
			<div class="series-link disabled">
				<span class="link-label">Last in series</span>
			</div>
		{/if}
	</div>
</aside>

<style>
	.post-series {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		border-left: 3px solid var(--accent);
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.series-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.25rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.series-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--accent);
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.series-badge {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--accent);
		margin-bottom: 0.25rem;
	}

	.series-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-main);
		margin: 0;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.series-title a {
		color: var(--text-main);
		text-decoration: none;
		transition: color 150ms;
	}

	.series-title a:hover {
		color: var(--accent);
	}

	.series-nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.series-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--bg-soft);
		border: 1px solid var(--border-subtle);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 150ms;
	}

	.series-link.prev {
		justify-content: flex-start;
	}

	.series-link.next {
		justify-content: flex-end;
	}

	.series-link:not(.disabled):hover {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.series-link.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		justify-content: center;
	}

	.link-icon {
		width: 1.125rem;
		height: 1.125rem;
		color: var(--text-subtle);
		flex-shrink: 0;
	}

	.series-link:not(.disabled):hover .link-icon {
		color: var(--accent);
	}

	.link-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.link-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-subtle);
	}

	.link-title {
		font-size: 0.875rem;
		color: var(--text-main);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 640px) {
		.series-nav {
			grid-template-columns: 1fr;
		}

		.series-link.prev,
		.series-link.next {
			justify-content: flex-start;
		}
	}
</style>
