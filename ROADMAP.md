# EdgePress: Roadmap & Architecture Review

**Date:** 2025-11-27
**Status:** Phase 0 Complete -> Moving to Phase 1 (Maturity & Features)

## 🎯 Executive Summary

EdgePress is currently a robust **single-tenant application** built on a cutting-edge stack (SvelteKit + Cloudflare D1/KV/AI). The foundation is solid.

To achieve your long-term goal of making this a **distributable Node.js framework** (like a serverless Ghost/WordPress alternative) that others can deploy, we need to shift focus from "hardcoded logic" to "configuration-driven architecture."

This document outlines the path from **"My Blog"** to **"EdgePress Framework"**.

---

## 🏗 Architecture & Framework Potential

### Current State
- **Strengths:** Excellent use of Cloudflare specifics (D1 for relational data, KV for speed, AI for features). The `settings` table is a great start for dynamic config.
- **Weakness:** The code currently assumes a specific directory structure and schema that might be hard for a third party to update without forking the repo.

### 🧪 Path to "Node.js Package"
To make this a package (`npm create edgepress-app`), we need to decouple the **Core Engine** from the **User Site**.

1.  **The "Theme" Engine (Priority: High)**
    *   **Goal:** Allow users to swap designs without touching backend code.
    *   **Recommendation:** Move hardcoded Svelte components in `src/routes/(public)` to a `src/themes/[theme_name]` directory.
    *   **Mechanism:** usage of dynamic imports or a build-step configuration that copies the selected theme to the routes folder.

2.  **Plugin/Injection System (Priority: Medium)**
    *   **Current:** You have an `injection_points` table (Smart!).
    *   **Future:** Expand this to allow "Hooks". Instead of just injecting HTML, allow registering custom Svelte components (Islands) into specific slots (e.g., `<Comments />` after `<PostContent />`).

3.  **Config Validation (Priority: High)**
    *   **Action:** Introduce **Zod** for strictly validating `wrangler.toml` environment variables and database inputs. This prevents "silent failures" when other users try to deploy your code.

---

## 🚀 Feature Roadmap

### 1. The "Projects" Portfolio (Showcase)
Currently, "Projects" are just Posts with a category. To make this a true portfolio node:

*   **Database Update:** Add a dedicated `projects` table (or extend `posts` metadata) with specific fields:
    *   `repo_url` (GitHub/GitLab)
    *   `demo_url` (Live link)
    *   `tech_stack` (JSON array: `['Svelte', 'Cloudflare', 'Rust']`)
    *   `status` (Active, Archived, MVP)
*   **UI:** Create a "Card" layout distinct from blog posts, featuring the `hero_image` prominently and "View Demo" / "View Code" buttons.

### 2. Contact Form with Turnstile (Anti-Spam)
Serverless forms are prime targets for spam.
*   **Action:** Implement Cloudflare Turnstile (invisible CAPTCHA).
*   **Flow:**
    1.  Frontend: Turnstile widget generates a token.
    2.  POST `/api/contact`: Send token + message.
    3.  Backend: Verify token with Cloudflare API.
    4.  Backend: Save message to D1 (or forward via Email routing).

### 3. AI Capabilities (Maturity)
Your current `BART` summarization is a great start.
*   **Next Step:** **Semantic Search (RAG)**.
    *   Use Cloudflare **Vectorize** (vector database).
    *   When saving a post, generate embeddings (using `bge-base-en-v1.5`) and store them.
    *   Allow users to search "how do I deploy?" and find the "Architecture" post even if the word "deploy" isn't in the title.

---

## 🛡️ Maturity & Stability Strategy

Before writing full test suites, adopt **Defensive Programming**.

### 1. Zod Validation (Immediate Win)
Replace manual checks like `if (!content) ...` with schema validation.

```typescript
// Example
const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional()
});
```

### 2. Error Boundary & Logging
*   **Global Error Hook:** Ensure `hooks.server.ts` catches unhandled exceptions and logs them (to D1 or a tailored logging service) so you know when your production site breaks.

### 3. Testing (Later)
*   **Phase 1:** **Playwright E2E**. It gives the highest ROI. Just test the critical paths: "Can I log in?", "Can I create a post?", "Does the homepage load?".
*   **Phase 2:** Unit tests for complex logic (like the markdown parser or potential future complex auth).

---

## 📅 Recommended Immediate Plan

1.  **Refactor "Projects":** Separate them from standard "Posts" to allow for rich metadata (Repository links, tech stack badges).
2.  **Add Contact Form:** A static site needs a way for people to reach you.
3.  **Implement Zod:** Secure your API endpoints now before the codebase grows larger.

---

**Ready to start?** I recommend we begin with **Refactoring the Projects Data Model** to match your vision of a portfolio showcase.
