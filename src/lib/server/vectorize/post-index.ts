import type { Ai, VectorizeIndex } from '@cloudflare/workers-types';

/**
 * Model identifier used for post embeddings in the Cloudflare AI catalog.
 * BGE-Base offers a good balance of quality and latency for semantic search.
 */
export const POST_EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';

/** Maximum number of characters sent to the embedding model to control cost. */
export const MAX_EMBEDDING_INPUT_LENGTH = 12000;

/** Upper bound for semantic search results returned to clients. */
export const MAX_SEARCH_RESULTS = 20;

/** Metadata stored alongside each post vector to support filtering. */
export interface PostVectorMetadata {
        status: 'draft' | 'published';
        slug: string;
        title: string;
        excerpt?: string;
        publishedAt?: string | null;
        categoryId?: string | null;
}

/** Payload required to compute and store an embedding for a post. */
export interface PostVectorPayload extends PostVectorMetadata {
        id: string;
        contentMd: string;
}

/** Semantic search match returned from Vectorize. */
export interface SemanticSearchResult extends PostVectorMetadata {
        id: string;
        score: number;
}

/**
 * Build a concise string for embedding that mixes title, excerpt, and markdown body.
 * @param payload Post content and metadata required for embedding.
 * @returns A trimmed string safe to send to the embedding model.
 */
export function buildEmbeddingInput(payload: PostVectorPayload): string {
        const sections = [payload.title, payload.excerpt ?? '', payload.contentMd];
        const raw = sections.filter(Boolean).join('\n\n');
        return raw.length > MAX_EMBEDDING_INPUT_LENGTH
                ? raw.slice(0, MAX_EMBEDDING_INPUT_LENGTH)
                : raw;
}

/**
 * Generate an embedding vector for the provided text using Cloudflare AI.
 * @param ai Cloudflare AI binding from the platform environment.
 * @param text Content to embed.
 * @returns Numeric embedding vector suitable for Vectorize.
 */
export async function generateEmbedding(ai: Ai, text: string): Promise<number[]> {
        const response = await ai.run(POST_EMBEDDING_MODEL, { text });
        const data = (response as { data?: Array<{ embedding: number[] }> }).data ?? [];
        if (!data[0]?.embedding) {
                throw new Error('Embedding response missing data');
        }
        return data[0].embedding;
}

/**
 * Upsert a post vector into the configured Vectorize index.
 * @param ai Cloudflare AI binding for embedding generation.
 * @param index Cloudflare Vectorize binding for storage.
 * @param payload Post content and metadata to store.
 */
export async function upsertPostVector(
        ai: Ai,
        index: VectorizeIndex,
        payload: PostVectorPayload
): Promise<void> {
        const vector = await generateEmbedding(ai, buildEmbeddingInput(payload));
        const metadata = {
                status: payload.status,
                slug: payload.slug,
                title: payload.title,
                excerpt: payload.excerpt ?? '',
                publishedAt: payload.publishedAt ?? '',
                categoryId: payload.categoryId ?? ''
        } satisfies Record<string, string>;
        await index.upsert([
                {
                        id: payload.id,
                        values: vector,
                        metadata
                }
        ]);
}

/**
 * Remove a post vector from the Vectorize index when a post is deleted.
 * @param index Cloudflare Vectorize binding for storage.
 * @param postId Identifier of the post to remove.
 */
export async function deletePostVector(index: VectorizeIndex, postId: string): Promise<void> {
        await index.deleteByIds([postId]);
}

/**
 * Execute a semantic search over published posts.
 * @param ai Cloudflare AI binding for query embedding generation.
 * @param index Cloudflare Vectorize binding for storage.
 * @param query Free-form query string.
 * @param limit Maximum number of matches to return.
 * @param includeDrafts Whether to include drafts (defaults to published-only).
 * @returns Ranked semantic matches with stored metadata.
 */
export async function searchPosts(
        ai: Ai,
        index: VectorizeIndex,
        query: string,
        limit = 5,
        includeDrafts = false
): Promise<SemanticSearchResult[]> {
        const cappedLimit = Math.max(1, Math.min(limit, MAX_SEARCH_RESULTS));
        const vector = await generateEmbedding(ai, query);
        const response = await index.query(vector, {
                topK: cappedLimit,
                returnMetadata: true,
                filter: includeDrafts ? undefined : { status: 'published' }
        });
        const matches = (response as { matches?: Array<{ id: string; score: number; metadata?: PostVectorMetadata }> })
                .matches;
        if (!matches) {
                return [];
        }
        return matches
                .filter((match) => match.metadata)
                .map((match) => ({
                        id: match.id,
                        score: match.score,
                        ...((match.metadata ?? {}) as PostVectorMetadata)
                }));
}
