# Repository Guidelines

## Project Structure & Module Organization

- SvelteKit app in `src/`; route groups in `src/routes` (`(public)`, `(admin)`, `admin`, `{admin,api}`, `api`) with shared layouts in `+layout.*` and auth hooks in `hooks.server.ts`.
- UI in `src/lib/components/ui` (shadcn-style); shared logic in `src/lib/utils`, `src/lib/types`, `src/lib/server` (auth/db/cache stubs), and `src/lib/search`. Use `$lib/` alias for imports.
- Assets live in `static/`; build/config is via `wrangler.toml`, `svelte.config.js`, and `vite.config.ts`.
- Database schema/seeds are in `migrations/*.sql`; local secrets stay in `.dev.vars` (see `.dev.vars.example`), never committed.

## Build, Test, and Development Commands

- `npm install` — install deps.
- `npm run dev` — local server at `localhost:5173`; `npm run dev:remote` when you need Cloudflare bindings.
- `npm run build` / `npm run preview` — produce and serve the production bundle.
- `npm run check` — Svelte typecheck; `npm run lint` — ESLint; `npm run format:check` — Prettier dry run.
- `npm run validate` — check + lint + format gate before every PR. `npm run deploy` — build then `wrangler pages deploy .svelte-kit/cloudflare`.

## Coding Style & Naming Conventions

- Prettier: tabs (width 2), 100-char lines, single quotes, semicolons. Use `npm run format` to fix.
- ESLint: prefer `const`, `eqeqeq`, no `any`, no unused vars; interfaces/types/enums in PascalCase. Svelte rules block unsafe `@html` and missing `rel` on external links.
- Components/modules use PascalCase; route dirs stay kebab-case with `+page.svelte`, `+page.server.ts`, `+server.ts` patterns.

## Testing Guidelines

- No dedicated unit/e2e suite yet; current bar is `npm run validate`. If you add tests, co-locate `*.spec.ts` near the code/routes and document how to run them in the PR.

## Commit & Pull Request Guidelines

- Follow history: concise, present-tense subjects with optional prefixes (`feat:`, `chore:`, `fix:`) or short imperatives (“Refresh admin posts list…”).
- PRs should describe scope, link issues, list manual validation steps, and flag migrations or config changes. Attach screenshots for UI tweaks. Run `npm run validate` before pushing; keep secrets in `.dev.vars` only.

## Environment & Deployment Notes

- Cloudflare bindings: D1 (`DB`), KV (`SESSIONS`, `CACHE`), Images token/IDs. Example migration: `wrangler d1 execute edgepress-db-dev --file=./migrations/001_initial_schema.sql --local`.
- Keep `compatibility_date` and bindings in `wrangler.toml` aligned with Pages deploys; output target is `.svelte-kit/cloudflare`.
