-- ============================================================
-- Luka — Migration 002: Extended schema
-- ============================================================

-- ─── Lookup tables ───────────────────────────────────────────

-- Civil statuses (per psychologist)
create table civil_statuses (
  id               uuid        default uuid_generate_v4() primary key,
  psychologist_id  uuid        references profiles(id) on delete cascade not null,
  name             text        not null,
  sort_order       int         default 0,
  created_at       timestamptz default now()
);

alter table civil_statuses enable row level security;
create policy "civil_statuses: own"
  on civil_statuses for all using (auth.uid() = psychologist_id);

create index idx_civil_statuses_psychologist on civil_statuses (psychologist_id);

-- Insurers (shared global list seeded below + psychologist custom)
create table insurers (
  id               uuid        default uuid_generate_v4() primary key,
  name             text        not null,
  psychologist_id  uuid        references profiles(id) on delete cascade,  -- null = global
  sort_order       int         default 0,
  created_at       timestamptz default now()
);

alter table insurers enable row level security;
create policy "insurers: read all"
  on insurers for select using (psychologist_id is null or auth.uid() = psychologist_id);
create policy "insurers: own write"
  on insurers for all using (auth.uid() = psychologist_id);

create index idx_insurers_psychologist on insurers (psychologist_id);

-- Plans / modalities (linked to insurer)
create table plans (
  id               uuid        default uuid_generate_v4() primary key,
  insurer_id       uuid        references insurers(id) on delete cascade,
  name             text        not null,
  psychologist_id  uuid        references profiles(id) on delete cascade,  -- null = global
  sort_order       int         default 0,
  created_at       timestamptz default now()
);

alter table plans enable row level security;
create policy "plans: read all"
  on plans for select using (psychologist_id is null or auth.uid() = psychologist_id);
create policy "plans: own write"
  on plans for all using (auth.uid() = psychologist_id);

create index idx_plans_insurer on plans (insurer_id);
create index idx_plans_psychologist on plans (psychologist_id);

-- ─── Extend profiles ─────────────────────────────────────────
alter table profiles
  add column if not exists preferred_name      text,
  add column if not exists ordem_psicologos    text,
  add column if not exists address             text,
  add column if not exists postal_code         text,
  add column if not exists city                text,
  add column if not exists country             text,
  add column if not exists nif                 text,
  add column if not exists onboarding_completed boolean default false;

-- ─── Extend patients ─────────────────────────────────────────

-- Drop old gender check to allow more values
alter table patients drop constraint if exists patients_gender_check;

alter table patients
  -- Identification
  add column if not exists preferred_name      text,
  add column if not exists profession          text,
  add column if not exists education           text,
  add column if not exists civil_status_id     uuid references civil_statuses(id) on delete set null,

  -- Address
  add column if not exists address             text,
  add column if not exists billing_address     text,
  add column if not exists postal_code         text,
  add column if not exists city                text,

  -- Documents
  add column if not exists nif                 text,  -- Portugal NIF

  -- Spouse / partner
  add column if not exists spouse_name         text,
  add column if not exists spouse_phone        text,
  add column if not exists spouse_email        text,

  -- Tutor (minors / guardianship)
  add column if not exists tutor_name          text,
  add column if not exists tutor_phone         text,
  add column if not exists tutor_email         text,

  -- Additional contacts (JSONB array: [{relation, name, phone, email}])
  add column if not exists additional_contacts jsonb default '[]'::jsonb,

  -- Health coverage
  add column if not exists insurer_id          uuid references insurers(id) on delete set null,
  add column if not exists plan_id             uuid references plans(id) on delete set null,
  add column if not exists sns_user_number     text,
  add column if not exists local_protocol      text,

  -- Consents
  add column if not exists consent_rgpd        boolean default false,
  add column if not exists consent_informed    boolean default false,
  add column if not exists consent_minors      boolean default false;

-- Unique NIF per table (partial index, only when non-null)
create unique index if not exists idx_patients_nif_unique
  on patients (nif)
  where nif is not null and nif <> '';

create unique index if not exists idx_patients_cpf_unique
  on patients (cpf)
  where cpf is not null and cpf <> '';

-- Indexes for search
create index if not exists idx_patients_tutor_name
  on patients using gin (to_tsvector('simple', coalesce(tutor_name, '')));

create index if not exists idx_patients_nif_text on patients (nif);
create index if not exists idx_patients_cpf_text on patients (cpf);

-- ─── Seed global insurers ────────────────────────────────────
insert into insurers (name, psychologist_id, sort_order) values
  ('Sem seguradora', null, 0),
  ('SNS — Serviço Nacional de Saúde', null, 1),
  ('ADSE', null, 2),
  ('ADM — Assistência na Doença aos Militares', null, 3),
  ('SAD/GNR', null, 4),
  ('SAD/PSP', null, 5),
  ('SAMS — Serviços de Assistência Médico-Social', null, 6),
  ('SAMS/SIB', null, 7),
  ('SSCGD — Caixa Geral de Depósitos', null, 8),
  ('PT/ACS — Assistência na Doença', null, 9),
  ('Médis', null, 10),
  ('Multicare (Fidelidade)', null, 11),
  ('Advancecare', null, 12),
  ('Allianz Cuidados de Saúde', null, 13),
  ('Tranquilidade Saúde (Generali)', null, 14),
  ('Generali Saúde', null, 15),
  ('Lusitania Saúde', null, 16),
  ('Liberty Saúde', null, 17),
  ('Ageas Saúde', null, 18),
  ('Médico Online (MGEN/MGC)', null, 19),
  ('Future Healthcare', null, 20),
  ('Cosec / Crédito Agrícola Vida', null, 21),
  ('Mútua dos Pescadores', null, 22),
  ('Médis Dental', null, 23),
  ('Vitória Seguros — Saúde', null, 24),
  ('Outro / Privado', null, 25)
on conflict do nothing;

-- ─── Seed global plans (generic, linked to null insurer) ─────
insert into plans (insurer_id, name, psychologist_id, sort_order) values
  (null, 'Sem plano específico', null, 0),
  (null, 'Regime Convencionado', null, 1),
  (null, 'Regime Livre', null, 2)
on conflict do nothing;
