-- Migration 011: Add birth_date column to profiles
-- Applied via SQL editor / migration file

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;
