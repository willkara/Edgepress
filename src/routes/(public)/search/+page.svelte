<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { fetchSearchIndex, localSearch, remoteSearch } from '$lib/search/client';
	import type { SearchIndexItem, SearchResult } from '$lib/types/search';

	let query = '';
	let results: SearchResult[] = [];
	let index: SearchIndexItem[] = [];
	let loadingIndex = false;
	let loadingRemote = false;
	let indexReady = false;
	let error: string | null = null;
	let usedRemote = false;

	let debounceId: ReturnType<typeof setTimeout> | null = null;

	async function ensureIndex() {
		if (indexReady || loadingIndex) return;
		loadingIndex = true;
		index = await fetchSearchIndex();
		indexReady = index.length > 0;
		loadingIndex = false;
	}

	function mergeResults(remote: SearchResult[], local: SearchResult[]): SearchResult[] {
		const map = new Map<string, SearchResult>();
		for (const item of remote) {
			map.set(item.slug, item);
		}
		for (const item of local) {
			if (!map.has(item.slug)) {
				map.set(item.slug, item);
			}
		}
		return Array.from(map.values());
	}

	async function runSearch(term: string) {
		const trimmed = term.trim();
		error = null;

		if (trimmed.length < 2) {
			results = [];
			usedRemote = false;
			return;
		}

		await ensureIndex();

		const localResults = index.length ? localSearch(trimmed, index, 20) : [];
		results = localResults;
		usedRemote = false;

		// If local results are sparse, fall back to server FTS for accuracy
		if (localResults.length < 5) {
			loadingRemote = true;
			const remoteResults = await remoteSearch(trimmed, 20);
			loadingRemote = false;
			if (remoteResults.length) {
				results = mergeResults(remoteResults, localResults);
				usedRemote = true;
			}
		}
	}

	function handleInput(value: string) {
		query = value;
		if (debounceId) clearTimeout(debounceId);
		debounceId = setTimeout(() => runSearch(value), 200);
	}

	function submitSearch(event: Event) {
		event.preventDefault();
		runSearch(query);
	}
</script>

<svelte:head>
	<title>Search • EdgePress</title>
	<meta name="description" content="Search posts on EdgePress" />
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="search-hero">
	<h1>Search</h1>
	<p>Find posts by title, excerpt, or tags. We start local, then fall back to server search.</p>
</section>

<form class="search-form" on:submit={submitSearch}>
	<input
		type="search"
		placeholder="Search posts..."
		bind:value={query}
		on:input={(e) => handleInput(e.currentTarget.value)}
		minlength="2"
		autocomplete="off"
		aria-label="Search posts"
	/>
	<button type="submit">Search</button>
</form>

<div class="search-meta">
	<span>{indexReady ? 'Local index ready' : loadingIndex ? 'Loading index…' : 'Index loads on first search'}</span>
	{#if usedRemote}
		<span class="pill">Includes server results</span>
	{/if}
	{#if loadingRemote}
		<span class="pill">Querying server…</span>
	{/if}
</div>

<div class="search-results" aria-live="polite">
	{#if query.trim().length < 2}
		<p class="muted">Type at least 2 characters to search.</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if loadingIndex && !indexReady}
		<p class="muted">Loading search index…</p>
	{:else if results.length === 0}
		<p class="muted">No matches yet.</p>
	{:else}
		<ul>
			{#each results as result}
				<li class="result-card">
					<a class="result-title" href={`/blog/${result.slug}`}>{result.title}</a>
					<div class="result-meta">
						{formatDistanceToNow(new Date(result.published_at), { addSuffix: true })}
						{#if result.reading_time}
							· {result.reading_time} min read
						{/if}
						{#if result.tags.length}
							·
							<span class="tags">
								{result.tags.join(', ')}
							</span>
						{/if}
					</div>
					{#if result.highlight}
						<p class="result-snippet">{result.highlight}</p>
					{:else if result.excerpt}
						<p class="result-snippet">{result.excerpt}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search-hero {
		margin-bottom: 1rem;
	}
	.search-hero h1 {
		font-size: 2.4rem;
		margin-bottom: 0.25rem;
	}
	.search-hero p {
		color: var(--muted-foreground, #9ca3af);
	}
	.search-form {
		display: flex;
		gap: 0.75rem;
		margin: 1rem 0;
	}
	.search-form input {
		flex: 1;
		padding: 0.9rem 1rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		color: inherit;
	}
	.search-form button {
		padding: 0.9rem 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: linear-gradient(135deg, var(--accent-strong), var(--accent));
		color: #fff;
		cursor: pointer;
		box-shadow: 0 12px 30px rgba(var(--accent-rgb), 0.2);
		transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
	}
	.search-form button:hover {
		filter: brightness(1.05);
		box-shadow: 0 16px 36px rgba(var(--accent-rgb), 0.28);
	}
	.search-form button:active {
		transform: translateY(1px);
	}
	.search-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted-foreground, #9ca3af);
		font-size: 0.95rem;
		margin-bottom: 0.5rem;
	}
	.pill {
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		font-size: 0.85rem;
	}
	.search-results ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 1rem;
	}
	.result-card {
		padding: 1rem 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.02);
	}
	.result-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: inherit;
		text-decoration: none;
	}
	.result-title:hover {
		text-decoration: underline;
	}
	.result-meta {
		margin-top: 0.25rem;
		color: var(--muted-foreground, #9ca3af);
		font-size: 0.95rem;
	}
	.result-snippet {
		margin-top: 0.5rem;
		color: var(--muted-foreground, #9ca3af);
	}
	.muted {
		color: var(--muted-foreground, #9ca3af);
	}
	.error {
		color: #f87171;
	}
</style>
