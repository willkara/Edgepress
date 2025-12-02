-- Static Pages Table
-- Supports Ghost-style page templates with catch-all routing
-- Pages are similar to posts but simpler (no tags, categories, etc.)

PRAGMA foreign_keys = ON;

-- ============================================================================
-- PAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    author_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_md TEXT NOT NULL,
    content_html TEXT NOT NULL,
    excerpt TEXT,
    hero_image_id TEXT REFERENCES media(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    template TEXT DEFAULT 'page.njk', -- Custom template override (Ghost feature)
    published_at TEXT, -- ISO 8601 UTC string
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_published_at ON pages(published_at DESC);
CREATE INDEX idx_pages_author ON pages(author_id);

-- ============================================================================
-- FULL-TEXT SEARCH FOR PAGES (FTS5)
-- ============================================================================
CREATE VIRTUAL TABLE pages_fts USING fts5(
    title,
    content_md,
    content='pages',
    content_rowid='rowid'
);

-- Triggers to keep FTS in sync with pages table
CREATE TRIGGER pages_ai AFTER INSERT ON pages BEGIN
    INSERT INTO pages_fts(rowid, title, content_md)
    VALUES (NEW.rowid, NEW.title, NEW.content_md);
END;

CREATE TRIGGER pages_ad AFTER DELETE ON pages BEGIN
    INSERT INTO pages_fts(pages_fts, rowid, title, content_md)
    VALUES ('delete', OLD.rowid, OLD.title, OLD.content_md);
END;

CREATE TRIGGER pages_au AFTER UPDATE ON pages BEGIN
    INSERT INTO pages_fts(pages_fts, rowid, title, content_md)
    VALUES ('delete', OLD.rowid, OLD.title, OLD.content_md);
    INSERT INTO pages_fts(rowid, title, content_md)
    VALUES (NEW.rowid, NEW.title, NEW.content_md);
END;
