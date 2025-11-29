import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchPosts, searchPostsCached } from '$lib/server/db/posts';
import { CachePresets, setCacheHeaders } from '$lib/server/cache/headers';
import { requireEnv } from '$lib/server/env';

export const GET: RequestHandler = async (event) => {
	const { url, setHeaders } = event;
	const q = (url.searchParams.get('q') ?? '').trim();
	const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') ?? '20')));

	// Gracefully return nothing for very short queries
	if (q.length < 2) {
		return json(
			{ results: [], tooShort: true },
			{ headers: { 'Cache-Control': CachePresets.apiRead() } }
		);
	}

	let env;
	try {
		env = requireEnv(event, ['DB', 'CACHE']);
	} catch {
		return json({ results: [], error: 'database_unavailable' }, { status: 503 });
	}

	const useCache = !!env.CACHE;

	try {
		setCacheHeaders(setHeaders, CachePresets.apiRead());

		const results = useCache
			? await searchPostsCached(env.DB, env.CACHE, q, limit)
			: await searchPosts(env.DB, q, limit);

		return json({ results });
	} catch (error) {
		console.error('Search API error', error);
		return json({ results: [], error: 'search_failed' }, { status: 500 });
	}
};
