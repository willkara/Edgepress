<script lang="ts">
	/**
	 * SearchResults Component
	 *
	 * Displays search results for posts and pages.
	 */

	import { formatDateRelative } from '$lib/utils/date';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import { ArrowLeft, Search } from 'lucide-svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import type { SearchResultsProps } from '$lib/themes/contracts';

	// Props from theme contract
	let { query, results, total, themeConfig, themeOptions }: SearchResultsProps = $props();

	// Build breadcrumbs
	const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Search Results' }];
</script>

<div class="search-page">
	<!-- Back Link -->
	<a href="/" class="back-link">
		<ArrowLeft class="w-4 h-4" />
		Back to home
	</a>

	<Breadcrumbs items={breadcrumbItems} />

	<!-- Page Header -->
	<div class="page-header">
		<div class="search-icon">
			<Search class="w-8 h-8" />
		</div>
		<h1 class="page-title">Search Results</h1>
		<p class="search-query">"{query}"</p>
		<p class="page-subtitle">
			{total}
			{total === 1 ? 'result' : 'results'} found
		</p>
	</div>

	<!-- Results List -->
	{#if results.length === 0}
		<div class="empty-state">
			<p>No results found for "{query}".</p>
			<p class="empty-hint">Try using different keywords or check your spelling.</p>
		</div>
	{:else}
		<div class="results-list">
			{#each results as result}
				<SpotlightCard>
					<article class="result-card">
						<div class="result-meta">
							<span class="result-type">{result.type}</span>
							· {formatDateRelative(result.published_at)}
							{#if result.score}
								· <span class="result-score"
									>{Math.round(result.score * 100)}% match</span
								>
							{/if}
						</div>
						<h2 class="result-title">
							<a href={result.type === 'post' ? `/blog/${result.slug}` : `/${result.slug}`}>
								{result.title}
							</a>
						</h2>
						{#if result.excerpt}
							<p class="result-excerpt">
								{result.excerpt}
							</p>
						{/if}
					</article>
				</SpotlightCard>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-page {
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

	.page-header {
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
		text-align: center;
	}

	.search-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		height: 4rem;
		border-radius: 1rem;
		background: var(--accent-soft);
		color: var(--accent);
		margin-bottom: 1rem;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-main);
		margin: 0 0 0.5rem;
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
	}

	.search-query {
		font-size: 1.125rem;
		color: var(--accent);
		margin: 0 0 0.5rem;
		font-weight: 500;
	}

	.page-subtitle {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.result-card {
		background: var(--bg-elevated);
		border-radius: 0.9rem;
		border: 1px solid var(--border-subtle);
		padding: 1.2rem 1.4rem;
	}

	.result-meta {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-subtle);
		margin-bottom: 0.3rem;
	}

	.result-type {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		background: var(--accent-soft);
		color: var(--accent);
		border-radius: 0.25rem;
		font-weight: 600;
	}

	.result-score {
		color: var(--accent);
		font-weight: 600;
	}

	.result-title {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: var(--text-main);
		font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
		font-weight: 600;
	}

	.result-title a {
		color: var(--text-main);
		text-decoration: none;
		transition: color 150ms;
	}

	.result-title a:hover {
		color: var(--accent);
	}

	.result-excerpt {
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
		margin: 0 0 0.5rem;
	}

	.empty-hint {
		font-size: 0.875rem !important;
		color: var(--text-subtle) !important;
	}

	@media (max-width: 768px) {
		.page-title {
			font-size: 1.5rem;
		}

		.search-query {
			font-size: 1rem;
		}
	}
</style>
