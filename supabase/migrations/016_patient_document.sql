-- Migration 016: unificar cpf + nif em document_number + document_type
-- 2026-06-03

-- 1. Adicionar novas colunas
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS document_number TEXT,
  ADD COLUMN IF NOT EXISTS document_type   TEXT CHECK (document_type IN ('cpf', 'nif', 'other'));

-- 2. Migrar dados existentes (cpf tem prioridade sobre nif)
UPDATE patients
SET document_number = cpf, document_type = 'cpf'
WHERE cpf IS NOT NULL AND cpf != '' AND document_number IS NULL;

UPDATE patients
SET document_number = nif, document_type = 'nif'
WHERE nif IS NOT NULL AND nif != '' AND document_number IS NULL;

-- 3. Unique constraint: por psicólogo (mesmo paciente pode existir em psicólogos diferentes)
CREATE UNIQUE INDEX IF NOT EXISTS patients_psychologist_document_unique
ON patients(psychologist_id, document_number)
WHERE document_number IS NOT NULL;

-- 4. Manter colunas antigas por compatibilidade (podem ser removidas em migration futura)
-- cpf e nif permanecem como backup durante período de transição
