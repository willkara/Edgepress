import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSearchIndex, getSearchIndexCached } from '$lib/server/db/posts';
import { setCacheHeaders } from '$lib/server/cache/headers';
import { requireEnv } from '$lib/server/env';

export const GET: RequestHandler = async (event) => {
	const { setHeaders } = event;

	let env;
	try {
		env = requireEnv(event, ['DB', 'CACHE']);
	} catch {
		return json({ items: [], count: 0, error: 'database_unavailable' }, { status: 503 });
	}

	const useCache = !!env.CACHE;

	try {
		// Slightly longer TTL than typical API reads since the index changes infrequently
		setCacheHeaders(setHeaders, 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800');

		const items = useCache
			? await getSearchIndexCached(env.DB, env.CACHE)
			: await getSearchIndex(env.DB);

		return json({ items, count: items.length });
	} catch (error) {
		console.error('Search index API error', error);
		return json({ items: [], count: 0, error: 'search_index_failed' }, { status: 500 });
	}
};
