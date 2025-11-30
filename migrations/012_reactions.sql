-- Post Reactions Table
-- Stores user reactions (like, heart, bookmark) to posts

CREATE TABLE IF NOT EXISTS post_reactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'bookmark')),
    user_fingerprint TEXT NOT NULL, -- Browser fingerprint or user ID
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(post_id, reaction_type, user_fingerprint)
);

CREATE INDEX idx_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_reactions_fingerprint ON post_reactions(user_fingerprint);
CREATE INDEX idx_reactions_type ON post_reactions(reaction_type);

-- Add reaction counts to posts for quick aggregation
ALTER TABLE posts ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN heart_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN bookmark_count INTEGER NOT NULL DEFAULT 0;
