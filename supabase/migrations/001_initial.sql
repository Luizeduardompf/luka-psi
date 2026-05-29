-- ============================================================
-- Luka — Initial schema
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ─── Profiles (extends auth.users) ──────────────────────────
create table profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text        not null,
  crp         text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Patients ────────────────────────────────────────────────
create table patients (
  id                       uuid        default uuid_generate_v4() primary key,
  psychologist_id          uuid        references profiles(id) on delete cascade not null,
  full_name                text        not null,
  email                    text,
  phone                    text,
  cpf                      text,
  date_of_birth            date,
  gender                   text        check (gender in ('male','female','other','prefer_not_to_say')),
  status                   text        default 'active' check (status in ('active','inactive','waiting')),
  notes                    text,
  emergency_contact_name   text,
  emergency_contact_phone  text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ─── Row Level Security ──────────────────────────────────────
alter table profiles enable row level security;
alter table patients  enable row level security;

create policy "Profiles: own"  on profiles for all using (auth.uid() = id);
create policy "Patients: own"  on patients  for all using (auth.uid() = psychologist_id);

-- ─── updated_at trigger ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger trg_patients_updated_at
  before update on patients
  for each row execute function update_updated_at();

-- ─── Auto-create profile on signup ───────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Indexes ─────────────────────────────────────────────────
create index idx_patients_psychologist_id on patients (psychologist_id);
create index idx_patients_status          on patients (psychologist_id, status);
create index idx_patients_created_at      on patients (psychologist_id, created_at desc);
