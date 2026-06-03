-- Migration 013: add country_id and practice_location_id to patients
-- 2026-06-02

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id) ON DELETE SET NULL;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS practice_location_id UUID REFERENCES practice_locations(id) ON DELETE SET NULL;

-- RLS: inherit existing policies (columns are covered by row-level policies already in place)
