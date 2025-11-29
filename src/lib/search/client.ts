import type { SearchIndexItem, SearchResult } from '$lib/types/search';

function isSearchIndexItems(value: unknown): value is SearchIndexItem[] {
	return Array.isArray(value);
}

function isSearchResults(value: unknown): value is SearchResult[] {
	return Array.isArray(value);
}

let indexPromise: Promise<SearchIndexItem[]> | null = null;
let cachedIndex: SearchIndexItem[] = [];

export async function fetchSearchIndex(): Promise<SearchIndexItem[]> {
	if (cachedIndex.length) {
		return cachedIndex;
	}

	indexPromise ??= fetch('/api/search/index')
		.then(async (res) => {
			if (!res.ok) {
				throw new Error(`Failed to load search index (${res.status})`);
			}
			const raw = (await res.json()) as unknown;
			if (raw && typeof raw === 'object' && 'items' in raw) {
				const maybeItems = (raw as { items?: unknown }).items;
				if (isSearchIndexItems(maybeItems)) {
					return maybeItems;
				}
			}
			return [];
		})
		.catch((err) => {
			console.error('Failed to fetch search index', err);
			return [];
		})
		.finally(() => {
			indexPromise = null;
		});

	cachedIndex = await indexPromise;
	return cachedIndex;
}

export function localSearch(
	query: string,
	items: SearchIndexItem[],
	limit = 20
): SearchResult[] {
	const tokens = query
		.trim()
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t.length > 1);

	if (tokens.length === 0) {
		return [];
	}

	const scored: Array<SearchResult & { score: number }> = [];

	for (const item of items) {
		let score = 0;

		const title = item.title.toLowerCase();
		const excerpt = item.excerpt?.toLowerCase() ?? '';
		const tags = item.tags.map((t) => t.toLowerCase());

		for (const token of tokens) {
			if (title.includes(token)) {
				score += 4;
			}
			if (excerpt.includes(token)) {
				score += 2;
			}
			if (tags.some((t) => t.includes(token))) {
				score += 3;
			}
		}

		if (score > 0) {
			scored.push({
				...item,
				highlight: item.excerpt,
				score
			});
		}
	}

	scored.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
	});

	return scored.slice(0, limit);
}

export async function remoteSearch(query: string, limit = 20): Promise<SearchResult[]> {
	const params = new URLSearchParams({ q: query, limit: String(limit) });

	try {
		const res = await fetch(`/api/search?${params.toString()}`);
		if (!res.ok) {
			throw new Error(`Remote search failed (${res.status})`);
		}
		const raw = (await res.json()) as unknown;
		if (raw && typeof raw === 'object' && 'results' in raw) {
			const maybeResults = (raw as { results?: unknown }).results;
			if (isSearchResults(maybeResults)) {
				return maybeResults;
			}
		}
		return [];
	} catch (error) {
		console.error('Remote search error', error);
		return [];
	}
}
