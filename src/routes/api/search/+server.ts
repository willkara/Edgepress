import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MAX_SEARCH_RESULTS, searchPosts } from '$lib/server/vectorize/post-index';

/** Maximum query length allowed for semantic search inputs. */
const MAX_QUERY_LENGTH = 500;

/** Default number of results returned when the client does not specify a limit. */
const DEFAULT_RESULT_LIMIT = 5;

/**
 * GET /api/search
 * Generate an embedding for the incoming query and perform a Vectorize search.
 * Requires both AI and Vectorize bindings to be configured.
 */
export const GET: RequestHandler = async ({ url, platform }) => {
	const query = (url.searchParams.get('q') ?? '').trim();
	if (!query) {
		throw error(400, 'Query parameter "q" is required');
	}
	if (query.length > MAX_QUERY_LENGTH) {
		throw error(400, 'Query is too long for semantic search');
	}

	const rawLimit = Number.parseInt(url.searchParams.get('limit') ?? `${DEFAULT_RESULT_LIMIT}`, 10);
	const limit = Number.isNaN(rawLimit)
		? DEFAULT_RESULT_LIMIT
		: Math.max(1, Math.min(rawLimit, MAX_SEARCH_RESULTS));

	const ai = platform?.env?.AI;
	const vectorize = platform?.env?.VECTORIZE;
	if (!ai || !vectorize) {
		throw error(503, 'Semantic search is not available');
	}

	try {
		const results = await searchPosts(ai, vectorize, query, limit, false);
		return json({ query, results });
	} catch (vectorError) {
		console.error('Semantic search failed:', vectorError);
		throw error(500, 'Failed to complete semantic search');
	}
};
