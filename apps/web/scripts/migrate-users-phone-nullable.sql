-- Migration: Make users.phone nullable for auto-sync from NeonAuth
-- Users who sign up via NeonAuth won't have a phone until they provide one

ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;
