-- Migration: Drop OTP columns if they exist
-- Run this against your database when ready: psql -U <user> -d <db> -f 2026-07-30-drop-otp-columns.sql

ALTER TABLE users DROP COLUMN IF EXISTS otp;
ALTER TABLE users DROP COLUMN IF EXISTS otp_expires_at;

-- Optional: remove any indexes referencing otp columns (none expected in current schema)
