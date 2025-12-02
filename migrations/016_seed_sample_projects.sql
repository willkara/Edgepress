-- Seed Sample Projects
-- Inserts sample data into the projects table.

INSERT INTO projects (
    id, slug, title, description, content_md,
    hero_image_id, repo_url, demo_url, tech_stack,
    is_featured, display_order, created_at, updated_at
) VALUES
(
    'proj_1', 'edgepress-blog', 'EdgePress Blog Platform',
    'A high-performance blogging platform built with SvelteKit and Cloudflare Workers.',
    '# EdgePress Blog Platform

This is a sample project demonstrating the capabilities of EdgePress. It leverages SvelteKit for the frontend, Cloudflare Workers for the backend logic and routing, D1 for the database, and KV for caching and sessions.

## Features

*   Fast, serverless architecture
*   Markdown content support
*   Integrated image management
*   Semantic search with Cloudflare Vectorize

## Technologies Used

*   SvelteKit
*   Cloudflare D1
*   Cloudflare KV
*   Cloudflare Workers AI (for Vectorize)
*   Tailwind CSS
*   Tiptap Editor
',
    NULL, -- No hero image for now
    'https://github.com/willkara/edgepress',
    'https://edgepress.pages.dev',
    '["SvelteKit", "Cloudflare Workers", "D1", "KV", "Tailwind CSS"]',
    1, -- Featured
    1,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days')
),
(
    'proj_2', 'serverless-api-gateway', 'Serverless API Gateway',
    'A robust API gateway built on Cloudflare Workers for secure and scalable microservices.',
    '# Serverless API Gateway

This project showcases a serverless API gateway implementation using Cloudflare Workers. It provides features like authentication (JWT validation), rate limiting, and request/response transformation, all running at the edge.

## Key Components

*   **JWT Authentication:** Securely validate incoming requests.
*   **Rate Limiting:** Protect backend services from abuse.
*   **Request/Response Transformation:** Modify headers and payloads on the fly.

## Technologies Used

*   Cloudflare Workers
*   Cloudflare KV
*   TypeScript
    ',
    NULL,
    'https://github.com/willkara/serverless-api-gateway',
    'https://api-gateway-demo.pages.dev',
    '["Cloudflare Workers", "TypeScript", "JWT", "KV"]',
    0, -- Not featured
    2,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days')
);
