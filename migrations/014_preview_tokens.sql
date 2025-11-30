-- Preview Token Support
-- Allows generating shareable preview links for draft/unpublished posts

ALTER TABLE posts ADD COLUMN preview_token TEXT;
ALTER TABLE posts ADD COLUMN preview_expires_at TEXT;

CREATE UNIQUE INDEX idx_posts_preview_token ON posts(preview_token) WHERE preview_token IS NOT NULL;
CREATE INDEX idx_posts_preview_expires ON posts(preview_expires_at) WHERE preview_expires_at IS NOT NULL;
