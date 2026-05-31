-- ============================================================
-- Luka — Migration 005: Forms fixes — RLS, Storage, Policies
-- ============================================================

-- ─── Garantir que update público em form_submissions funciona ─
-- A policy "own" usa FOR ALL (inclui update), mas o paciente não tem auth.
-- Precisamos de policy separada para update público (controle por app).

-- Remover policy "own" que bloqueia updates sem auth e recriar como select+insert+delete
do $$
begin
  -- Drop e recriar de forma idempotente
  drop policy if exists "form_submissions: own" on form_submissions;
  drop policy if exists "form_submissions: psychologist select" on form_submissions;
  drop policy if exists "form_submissions: psychologist insert" on form_submissions;
  drop policy if exists "form_submissions: psychologist delete" on form_submissions;
  drop policy if exists "form_submissions: public update status" on form_submissions;
exception when others then null;
end $$;

-- Psicólogo: select dos próprios
create policy "form_submissions: psychologist select"
  on form_submissions for select
  using (auth.uid() = psychologist_id);

-- Psicólogo: insert
create policy "form_submissions: psychologist insert"
  on form_submissions for insert
  with check (auth.uid() = psychologist_id);

-- Psicólogo: delete dos próprios
create policy "form_submissions: psychologist delete"
  on form_submissions for delete
  using (auth.uid() = psychologist_id);

-- Público: update por token (paciente salva respostas, muda status)
-- Controle de acesso (senha + expiração) feito na camada de aplicação
create policy "form_submissions: public update status"
  on form_submissions for update
  using (true)
  with check (true);

-- ─── form_audit_logs: permitir insert sem auth (paciente conclui) ─
do $$
begin
  drop policy if exists "form_audit_logs: public insert" on form_audit_logs;
exception when others then null;
end $$;

create policy "form_audit_logs: public insert"
  on form_audit_logs for insert
  with check (true);

-- ─── Storage: bucket avatars para logos dos psicólogos ──────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Drop e recriar policies de storage
do $$
begin
  drop policy if exists "avatars: public read" on storage.objects;
  drop policy if exists "avatars: authenticated upload" on storage.objects;
  drop policy if exists "avatars: own update" on storage.objects;
  drop policy if exists "avatars: own delete" on storage.objects;
exception when others then null;
end $$;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "avatars: own update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid() is not null);

create policy "avatars: own delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid() is not null);

-- ─── Garantir função de expiração existe ────────────────────────
create or replace function expire_form_submissions()
returns void
language plpgsql
security definer
as $$
begin
  update form_submissions
  set status = 'expired'
  where status in ('pending', 'in_progress')
    and expires_at is not null
    and expires_at < now();
end;
$$;

-- ─── Índice em token para lookup rápido (sem auth) ──────────────
create index if not exists idx_form_submissions_token
  on form_submissions (token);

-- ─── Constraint de unicidade em form_responses (upsert seguro) ──
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'form_responses_submission_question_unique'
  ) then
    alter table form_responses
      add constraint form_responses_submission_question_unique
      unique (submission_id, question_id);
  end if;
exception when others then null;
end $$;
