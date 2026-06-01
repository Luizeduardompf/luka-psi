-- Migration 007 — tabela genders + gender_id em profiles/patients + commercial_name em profiles
-- Aplicada em: 2026-06-01

-- ─── Tabela de gêneros ────────────────────────────────────────────────────────
CREATE TABLE genders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  pronoun_treatment text NOT NULL DEFAULT 'Dr(a).',
  sort_order    int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Valores padrão do sistema
INSERT INTO genders (name, pronoun_treatment, sort_order) VALUES
  ('Masculino',             'Dr.',     1),
  ('Feminino',              'Dra.',    2),
  ('Não-binário',           'Dr(a).', 3),
  ('Prefiro não informar',  'Dr(a).', 4);

-- RLS: leitura pública (sem auth necessária — usado também em formulários públicos)
ALTER TABLE genders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "genders_select_all" ON genders FOR SELECT USING (true);

-- ─── Profiles: gender_id + commercial_name ────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN gender_id       uuid REFERENCES genders(id) ON DELETE SET NULL,
  ADD COLUMN commercial_name text;

-- ─── Patients: gender_id (mantém coluna gender text por compatibilidade) ──────
ALTER TABLE patients
  ADD COLUMN gender_id uuid REFERENCES genders(id) ON DELETE SET NULL;
