-- Migration 015: add DDI columns for spouse, tutor and emergency contact
-- 2026-06-02

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS spouse_phone_ddi TEXT,
  ADD COLUMN IF NOT EXISTS tutor_phone_ddi TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone_ddi TEXT;
