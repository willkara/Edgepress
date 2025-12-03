<script lang="ts">
	import { fetchSearchIndex, localSearch, remoteSearch } from '$lib/search/client';
	import type { SearchIndexItem, SearchResult } from '$lib/types/search';
	import { getActiveTheme } from '$lib/themes/config';

	// Get active theme and components
	const theme = getActiveTheme();
	const SearchResults = theme.components.SearchResults;

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

	// Transform results to match theme props
	$: transformedResults = results.map((result) => ({
		id: result.slug,
		title: result.title,
		slug: result.slug,
		excerpt: result.highlight || result.excerpt || null,
		hero_image_url: null,
		published_at: result.published_at,
		author_name: 'Unknown',
		type: 'post' as const,
		score: result.score
	}));
</script>

<svelte:head>
	<title>Search • EdgePress</title>
	<meta name="description" content="Search posts on EdgePress" />
	<meta name="robots" content="noindex" />
</svelte:head>

<SearchResults
	{query}
	results={transformedResults}
	total={results.length}
	themeConfig={theme.config}
	themeOptions={{}}
/>
