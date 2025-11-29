-- Seed Sample Data (Consolidated & UTC Corrected)
-- Inserts categories, tags, and sample posts using strictly ISO 8601 UTC dates.

-- 1. Categories
INSERT INTO categories (id, name, slug, created_at) VALUES
('cat_tech', 'Technology', 'technology', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('cat_life', 'Lifestyle', 'lifestyle', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- 2. Tags
INSERT INTO tags (id, name, slug, created_at) VALUES
('tag_svelte', 'SvelteKit', 'sveltekit', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_edge', 'Edge Computing', 'edge-computing', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_db', 'Database', 'database', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- 3. Initial Admin (Re-inserting correctly for seed consistency if 002 is skipped)
-- Password is 'password' (bcrypt hash)
INSERT OR IGNORE INTO users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
    'user_admin',
    'admin@example.com',
    '$2a$10$r.z.i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i', -- Placeholder
    'EdgePress Admin',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

-- 4. Sample Posts (Published in the past to ensure visibility)
INSERT INTO posts (
    id, author_id, category_id, title, slug,
    content_md, content_html, excerpt,
    status, published_at, created_at, updated_at, reading_time, view_count
) VALUES
(
    'post_1', 'user_admin', 'cat_tech',
    'Welcome to EdgePress',
    'welcome-to-edgepress',
    '# Welcome to EdgePress\n\nThis is a sample post running on the edge.',
    '<h1>Welcome to EdgePress</h1><p>This is a sample post running on the edge.</p>',
    'A first look at the new blogging platform.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'), -- Yesterday
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'),
    1,
    10
),
(
    'post_2', 'user_admin', 'cat_tech',
    'Understanding D1 and SvelteKit',
    'understanding-d1-sveltekit',
    '# D1 Database\n\nCloudflare D1 is powerful.',
    '<h1>D1 Database</h1><p>Cloudflare D1 is powerful.</p>',
    'Deep dive into edge databases.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'), -- 2 hours ago
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'),
    5,
    5
);

-- 5. Post Tags
INSERT INTO post_tags (post_id, tag_id) VALUES
('post_1', 'tag_svelte'),
('post_1', 'tag_edge'),
('post_2', 'tag_db'),
('post_2', 'tag_edge');