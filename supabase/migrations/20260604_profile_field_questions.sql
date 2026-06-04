-- Migration: profile_field_questions
-- Adiciona suporte a perguntas de formulário vinculadas ao perfil do paciente

-- 0. Adicionar 'profile_field' ao enum question_type
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'profile_field';

-- 1. Coluna profile_field_key em form_questions
ALTER TABLE form_questions
  ADD COLUMN IF NOT EXISTS profile_field_key TEXT NULL;

COMMENT ON COLUMN form_questions.profile_field_key IS
  'Chave do campo do paciente mapeado (ex: profession, gender_id). NULL = pergunta livre.';

-- 2. Tabela patient_field_sources
CREATE TABLE IF NOT EXISTS patient_field_sources (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  field_key     TEXT        NOT NULL,
  submission_id UUID        REFERENCES form_submissions(id) ON DELETE SET NULL,
  filled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, field_key)
);

COMMENT ON TABLE patient_field_sources IS
  'Registra quais campos do paciente foram preenchidos via formulário e por qual submissão.';

-- 3. RLS em patient_field_sources
ALTER TABLE patient_field_sources ENABLE ROW LEVEL SECURITY;

-- Psicólogo lê as sources dos seus pacientes
CREATE POLICY "psychologist_select_field_sources"
  ON patient_field_sources
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE psychologist_id = auth.uid()
    )
  );

-- Psicólogo pode deletar (ao editar manualmente o campo)
CREATE POLICY "psychologist_delete_field_sources"
  ON patient_field_sources
  FOR DELETE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE psychologist_id = auth.uid()
    )
  );

-- anon pode inserir/atualizar via formulário — validado por submission ativo e não expirado
CREATE POLICY "anon_upsert_field_sources"
  ON patient_field_sources
  FOR INSERT
  TO anon
  WITH CHECK (
    submission_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.id = submission_id
        AND fs.patient_id = patient_field_sources.patient_id
        AND fs.status != 'completed'
        AND (fs.expires_at IS NULL OR fs.expires_at > now())
    )
  );

-- 4. RLS em patients: permitir anon UPDATE via submissão válida
-- (política adicional às já existentes)
CREATE POLICY "anon_update_patient_via_form"
  ON patients
  FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.patient_id = patients.id
        AND fs.status != 'completed'
        AND (fs.expires_at IS NULL OR fs.expires_at > now())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.patient_id = patients.id
        AND fs.status != 'completed'
        AND (fs.expires_at IS NULL OR fs.expires_at > now())
    )
  );

-- 5. Index para performance
CREATE INDEX IF NOT EXISTS idx_patient_field_sources_patient_id
  ON patient_field_sources (patient_id);

CREATE INDEX IF NOT EXISTS idx_form_questions_profile_field_key
  ON form_questions (profile_field_key)
  WHERE profile_field_key IS NOT NULL;
