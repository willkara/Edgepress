-- Projects Page Management
-- Adds support for managing the /projects page from admin

-- ============================================================================
-- FEATURED_PROJECTS TABLE
-- ============================================================================
-- Stores which posts should appear on the projects page and their order
CREATE TABLE featured_projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    custom_description TEXT, -- Optional override for the project description
    is_featured INTEGER NOT NULL DEFAULT 1, -- Can toggle visibility
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(post_id)
);

CREATE INDEX idx_featured_projects_order ON featured_projects(display_order);
CREATE INDEX idx_featured_projects_post ON featured_projects(post_id);
CREATE INDEX idx_featured_projects_featured ON featured_projects(is_featured);

-- ============================================================================
-- DEFAULT SETTINGS FOR PROJECTS PAGE
-- ============================================================================
INSERT INTO settings (key, value) VALUES
    ('projects_page_title', 'My Projects'),
    ('projects_page_subtitle', 'Explore the things I''ve built and the problems I''ve solved.'),
    ('projects_page_show_all', '1'); -- Show all posts with "Projects" category even if not featured

-- ============================================================================
-- CREATE PROJECTS CATEGORY (IF IT DOESN'T EXIST)
-- ============================================================================
INSERT OR IGNORE INTO categories (id, name, slug, created_at) VALUES
    (lower(hex(randomblob(16))), 'Projects', 'projects', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
