-- Wipe Database
-- Drops all tables to prepare for a clean schema apply.
-- Order matters due to foreign keys and virtual tables.

DROP TABLE IF EXISTS posts_fts; -- Virtual table (Drop FIRST to remove dependencies on posts)
DROP TABLE IF EXISTS daily_views;
DROP TABLE IF EXISTS injection_points;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;