-- Migration: Create dedicated projects table
-- Drops the old featured_projects table which relied on posts

-- 1. Create the new independent projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL, -- Short summary for the card
    content_md TEXT,           -- Optional full case study/details
    hero_image_id TEXT,        -- Cloudflare Image ID
    repo_url TEXT,
    demo_url TEXT,
    tech_stack TEXT,           -- JSON array of strings e.g. '["Svelte", "D1"]'
    is_featured INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_featured ON projects(is_featured, display_order);
CREATE INDEX idx_projects_order ON projects(display_order);

-- 2. Drop the old hybrid table
DROP TABLE IF EXISTS featured_projects;
