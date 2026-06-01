-- Migration 012: rename commercial_name to professional_name, add signature_url, nif unique
-- 2026-06-01

-- 1. Rename commercial_name → professional_name
ALTER TABLE profiles
  RENAME COLUMN commercial_name TO professional_name;

-- 2. Add signature_url column (if it doesn't exist already)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- 3. Add unique constraint on nif (non-null values only)
-- First ensure we don't already have it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_nif_key' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_nif_key UNIQUE (nif);
  END IF;
END$$;
