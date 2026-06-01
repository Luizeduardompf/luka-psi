-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009: Fix RLS for form_responses + new features
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Fix RLS: form_responses (paciente anon pode inserir/atualizar) ───────────
-- Allow anon to insert/upsert responses for non-completed submissions
DROP POLICY IF EXISTS "anon_insert_form_responses" ON form_responses;
CREATE POLICY "anon_insert_form_responses" ON form_responses
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.id = submission_id
        AND fs.status IN ('pending', 'in_progress')
    )
  );

DROP POLICY IF EXISTS "anon_update_form_responses" ON form_responses;
CREATE POLICY "anon_update_form_responses" ON form_responses
  FOR UPDATE TO anon
  USING (
    EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.id = submission_id
        AND fs.status IN ('pending', 'in_progress')
    )
  );

DROP POLICY IF EXISTS "anon_select_form_responses" ON form_responses;
CREATE POLICY "anon_select_form_responses" ON form_responses
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.id = submission_id
    )
  );

-- ─── Fix RLS: form_audit_logs (anon pode inserir) ────────────────────────────
DROP POLICY IF EXISTS "anon_insert_audit_logs" ON form_audit_logs;
CREATE POLICY "anon_insert_audit_logs" ON form_audit_logs
  FOR INSERT TO anon
  WITH CHECK (true);

-- ─── Countries table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS countries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text NOT NULL UNIQUE,          -- ISO 3166-1 alpha-2 (PT, BR, etc.)
  ddi         text NOT NULL DEFAULT '',      -- Ex: +351, +55
  tax_id_type text NOT NULL DEFAULT 'nif'   CHECK (tax_id_type IN ('nif', 'cpf', 'other')),
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_countries" ON countries;
CREATE POLICY "authenticated_select_countries" ON countries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_select_countries" ON countries;
CREATE POLICY "anon_select_countries" ON countries FOR SELECT TO anon USING (true);

-- Seed countries
INSERT INTO countries (name, code, ddi, tax_id_type, sort_order) VALUES
  ('Portugal', 'PT', '+351', 'nif', 1),
  ('Brasil',   'BR', '+55',  'cpf', 2),
  ('Espanha',  'ES', '+34',  'other', 3),
  ('França',   'FR', '+33',  'other', 4),
  ('Alemanha', 'DE', '+49',  'other', 5),
  ('Estados Unidos', 'US', '+1', 'other', 6),
  ('Reino Unido', 'GB', '+44', 'other', 7),
  ('Itália',   'IT', '+39',  'other', 8),
  ('Angola',   'AO', '+244', 'other', 9),
  ('Moçambique', 'MZ', '+258', 'other', 10)
ON CONFLICT (code) DO NOTHING;

-- ─── Genders: add terminology field (already created in 007, just add column) ─
ALTER TABLE genders ADD COLUMN IF NOT EXISTS terminology text NULL;
-- terminology = short honorific used in messages (e.g., "Dra.", "Dr.", "Sr.", "Sra.")
-- NULL = no honorific used

-- Update existing genders with default terminology
UPDATE genders SET terminology = 'Dr.'  WHERE name ILIKE '%masc%' AND terminology IS NULL;
UPDATE genders SET terminology = 'Dra.' WHERE name ILIKE '%fem%'  AND terminology IS NULL;

-- ─── Practice locations ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_locations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                text NOT NULL,
  address             text,
  postal_code         text,
  city                text,
  country_id          uuid REFERENCES countries(id),
  contact_person      text,
  phone               text,
  phone_ddi           text DEFAULT '',
  email               text,
  commission_type     text CHECK (commission_type IN ('percentage', 'fixed', 'none')) DEFAULT 'none',
  commission_value    numeric(10,2),
  payment_conditions  text,
  notes               text,
  color               text DEFAULT '#6366F1',  -- hex color identifier
  logo_url            text,
  is_active           boolean NOT NULL DEFAULT true,
  sort_order          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE practice_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_practice_locations" ON practice_locations;
CREATE POLICY "own_practice_locations" ON practice_locations
  FOR ALL TO authenticated
  USING (psychologist_id = auth.uid())
  WITH CHECK (psychologist_id = auth.uid());

-- ─── Terminologia (patient terminology config per psychologist) ───────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS patient_terminology text 
  NOT NULL DEFAULT 'Paciente' 
  CHECK (patient_terminology IN ('Paciente','Cliente','Utente','Beneficiário','Participante','Colaborador'));

-- ─── Profile: add professional name, signature, logo_storage fields ───────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_name text NULL;
-- professional_name replaces commercial_name semantically (rename in UI only, keep column)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signature_url text NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES countries(id);

-- ─── Patients: add country_id + phone_ddi ────────────────────────────────────
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone_ddi text DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES countries(id);

-- ─── NIF/CPF unique constraint on patients ────────────────────────────────────
-- Make cpf unique per psychologist (not globally, for privacy)
DROP INDEX IF EXISTS patients_cpf_psychologist_unique;
CREATE UNIQUE INDEX IF NOT EXISTS patients_cpf_psychologist_unique 
  ON patients(psychologist_id, cpf) WHERE cpf IS NOT NULL AND cpf != '';

DROP INDEX IF EXISTS patients_nif_psychologist_unique;
CREATE UNIQUE INDEX IF NOT EXISTS patients_nif_psychologist_unique 
  ON patients(psychologist_id, nif) WHERE nif IS NOT NULL AND nif != '';

-- ─── Profiles: unique NIF globally ───────────────────────────────────────────
DROP INDEX IF EXISTS profiles_nif_unique;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_nif_unique ON profiles(nif) WHERE nif IS NOT NULL AND nif != '';

-- ─── Update test data with valid CPFs/NIFs ────────────────────────────────────
-- Valid CPF: 123.456.789-09 (algoritmo validado)
-- Valid NIF Portugal: 123456789 (NIF válido)
UPDATE patients SET 
  cpf = '12345678909',
  phone_ddi = '+55'
WHERE full_name ILIKE '%Lucas Teste%' AND cpf IS NULL;

UPDATE patients SET 
  cpf = '98765432100',
  phone_ddi = '+55'
WHERE full_name ILIKE '%Marina Teste%' AND cpf IS NULL;

-- Update psychologist profile with valid NIF
UPDATE profiles SET 
  nif = '123456789',
  patient_terminology = 'Paciente'
WHERE id = 'c44198bc-7bb1-4420-9448-a84d1cdaf6d0'
  AND (nif IS NULL OR nif = '');

-- ─── Fix EXPO_PUBLIC_APP_URL value in form url builder ───────────────────────
-- The URL is built in code, not DB. This migration documents the fix.
-- The correct URL is already https://luka-psi-mocha.vercel.app set in Vercel env.

