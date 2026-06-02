-- Migration 014: add plan_name (free text) to patients
-- 2026-06-02
-- plan_id (UUID FK) mantido para uso futuro com planos estruturados

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS plan_name TEXT;
