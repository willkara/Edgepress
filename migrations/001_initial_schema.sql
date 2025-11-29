-- EdgePress Comprehensive Schema
-- Consolidated schema including all features:
-- - Core Users, Posts, Categories, Tags
-- - Media Management
-- - Settings & Injections
-- - Analytics (View Counts)
-- - Full-Text Search (FTS5)
-- - ISO 8601 UTC Date Standardization

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    -- Default to ISO 8601 UTC timestamp
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================================================
-- TAGS TABLE
-- ============================================================================
CREATE TABLE tags (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- ============================================================================
-- MEDIA TABLE
-- ============================================================================
CREATE TABLE media (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cf_image_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    alt_text TEXT,
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- ============================================================================
-- POSTS TABLE
-- ============================================================================
CREATE TABLE posts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    author_id TEXT NOT NULL REFERENCES users(id),
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_md TEXT NOT NULL,
    content_html TEXT NOT NULL,
    excerpt TEXT,
    hero_image_id TEXT REFERENCES media(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TEXT, -- ISO 8601 UTC string
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    reading_time INTEGER,
    view_count INTEGER NOT NULL DEFAULT 0 -- Analytics integration
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);

-- ============================================================================
-- POST_TAGS JUNCTION TABLE
-- ============================================================================
CREATE TABLE post_tags (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- ============================================================================
-- SETTINGS TABLE (KEY-VALUE STORE)
-- ============================================================================
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================================================
-- INJECTION_POINTS TABLE
-- ============================================================================
CREATE TABLE injection_points (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN ('head', 'body_start', 'body_end', 'post_before', 'post_after')),
    content TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_injection_location ON injection_points(location, is_active);

-- ============================================================================
-- ANALYTICS: DAILY VIEWS TABLE
-- ============================================================================
CREATE TABLE daily_views (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    view_date TEXT NOT NULL, -- stored as YYYY-MM-DD
    count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (post_id, view_date)
);

CREATE INDEX idx_daily_views_date ON daily_views(view_date);
CREATE INDEX idx_daily_views_post ON daily_views(post_id);

-- ============================================================================
-- FULL-TEXT SEARCH (FTS5)
-- ============================================================================
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content_md,
    content='posts',
    content_rowid='rowid'
);

-- Triggers to keep FTS in sync with posts table
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
    INSERT INTO posts_fts(rowid, title, content_md)
    VALUES (NEW.rowid, NEW.title, NEW.content_md);
END;

CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, content_md)
    VALUES ('delete', OLD.rowid, OLD.title, OLD.content_md);
END;

CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, content_md)
    VALUES ('delete', OLD.rowid, OLD.title, OLD.content_md);
    INSERT INTO posts_fts(rowid, title, content_md)
    VALUES (NEW.rowid, NEW.title, NEW.content_md);
END;