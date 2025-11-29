-- Fix Admin Password
-- Updates the admin user's password to 'password' (hash cost 12)
-- Using a SQL file to avoid shell variable expansion issues with '$' characters in the hash.

UPDATE users
SET password_hash = '$2a$12$Xxep96F4S5cRAQ5f6CSoduU6kfCn1c4t5myurF7Kh/jWVutbbSGvi'
WHERE email = 'admin@example.com';
