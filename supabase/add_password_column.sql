-- Add password column to users table (stores SHA-256 hash)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Set default password "osca2024" for all existing users
-- SHA-256("osca2024") = 0813a37dbf33b0bdbe67272e3fac031d0ae3e8b5e054ab8ca2e67ffdb39fa428
UPDATE users SET password = '0813a37dbf33b0bdbe67272e3fac031d0ae3e8b5e054ab8ca2e67ffdb39fa428' WHERE password IS NULL;
