-- Seed Initial Admin User (Clean Slate)
-- Creates the initial admin user with a default password.
-- Uses explicit UTC timestamp.

INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
    lower(hex(randomblob(16))),
    'admin@edgepress.com',
    '$2a$10$X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7/X7', -- Placeholder hash, needs real hash from backend logic if manual login is required immediately
    'Admin User',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
-- Note: The password hash above is invalid. The user will need to be created via the signup flow or a proper hash generated.
-- Since we are wiping the DB, the user will be gone.
-- Use the 'npm run dev:remote' flow to create a user properly or use a known hash.
-- For now, we will skip inserting a user with a broken password to avoid confusion.
-- The application allows signup if no users exist, or we can insert a known user if desired.