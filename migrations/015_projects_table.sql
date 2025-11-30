-- Projects table to store standalone project entries
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    tech_stack TEXT,
    repo_url TEXT,
    live_url TEXT,
    hero_image_id TEXT REFERENCES media(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'published',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_display_order ON projects(display_order);
