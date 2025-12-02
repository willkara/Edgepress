# Cloudflare Vectorize Embedding Recommendation

## Recommended model

Use the `@cf/baai/bge-base-en-v1.5` embedding model for semantic search. It balances latency and quality, returns 768-dimensional vectors, and aligns with Cloudflare Vectorize defaults so you can index without custom pipeline tuning.

## Why this model

- **Quality vs. cost:** The BGE base model delivers strong English semantic matching while keeping inference costs and latency lower than large-context or multilingual variants.
- **Dimension clarity:** The 768-dimension output lets you size your Vectorize index correctly and avoid mismatched schema errors during upsert/search.
- **Compatibility:** It pairs cleanly with the existing `AI` binding, so you can generate embeddings via `AI.run` wherever you handle post saves or publishes.

## How to use it

1. Add a Vectorize binding (e.g., `VECTORIZE`) next to `AI` in `wrangler.toml`.
2. In post create/update handlers, call `AI.run('@cf/baai/bge-base-en-v1.5', { text })` with canonical text (title + body + tags), then upsert the returned vector into the Vectorize index keyed by post ID and visibility.
3. In a `/api/search` endpoint, embed the query text with the same model and issue a similarity search against the index to return ranked results.
4. Enforce request limits (query length, result count) and log request IDs through AI/Vectorize calls to monitor performance and cost.

## Repository setup checklist

- `wrangler.toml` now binds `VECTORIZE` to the `edgepress-posts` index so Pages/Workers can reach the store.
- `src/app.d.ts` and `src/lib/server/env.ts` include `VECTORIZE`/`AI` typing to keep platform bindings type-safe.
- `src/lib/server/vectorize/post-index.ts` houses embedding, upsert, delete, and search helpers (all using `@cf/baai/bge-base-en-v1.5`).
- Admin post create/update/delete endpoints upsert or delete vectors after writes so content stays searchable.
- `GET /api/search` embeds the query, enforces basic limits, and queries Vectorize for published content only.
