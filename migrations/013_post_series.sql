-- Post Series Support
-- Allows grouping posts into series with ordered navigation

CREATE TABLE IF NOT EXISTS post_series (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_series_slug ON post_series(slug);

-- Add series_id and series_order to posts table
ALTER TABLE posts ADD COLUMN series_id TEXT REFERENCES post_series(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN series_order INTEGER;

CREATE INDEX idx_posts_series ON posts(series_id, series_order);
