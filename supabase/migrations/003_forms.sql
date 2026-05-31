-- ============================================================
-- Luka — Migration 003: Formulários Clínicos Personalizados
-- ============================================================

-- ─── Extend profiles with logo_url ───────────────────────────
alter table profiles
  add column if not exists logo_url text;

-- ─── Form Templates (sistema) ────────────────────────────────
-- Templates padrão do sistema (psychologist_id IS NULL = sistema)
-- Templates de psicólogos (psychologist_id NOT NULL = dono)
create table form_templates (
  id               uuid        default uuid_generate_v4() primary key,
  psychologist_id  uuid        references profiles(id) on delete cascade,  -- null = sistema
  title            text        not null,
  description      text,
  send_message     text,        -- mensagem padrão de envio (suporta placeholders)
  is_system        boolean     default false,
  is_archived      boolean     default false,
  cloned_from_id   uuid        references form_templates(id) on delete set null,
  sort_order       int         default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table form_templates enable row level security;

-- Sistema: qualquer autenticado pode ler
create policy "form_templates: read system"
  on form_templates for select
  using (is_system = true and auth.uid() is not null);

-- Psicólogo: lê/escreve os próprios
create policy "form_templates: own all"
  on form_templates for all
  using (auth.uid() = psychologist_id);

create index idx_form_templates_psychologist on form_templates (psychologist_id);
create index idx_form_templates_system on form_templates (is_system) where is_system = true;

-- ─── Form Sections ───────────────────────────────────────────
create table form_sections (
  id           uuid        default uuid_generate_v4() primary key,
  template_id  uuid        references form_templates(id) on delete cascade not null,
  title        text        not null,
  description  text,
  sort_order   int         default 0,
  created_at   timestamptz default now()
);

alter table form_sections enable row level security;

create policy "form_sections: via template"
  on form_sections for all
  using (
    exists (
      select 1 from form_templates t
      where t.id = form_sections.template_id
        and (t.is_system = true or t.psychologist_id = auth.uid())
    )
  );

create index idx_form_sections_template on form_sections (template_id, sort_order);

-- ─── Form Questions ──────────────────────────────────────────
create type question_type as enum (
  'short_text',    -- Resposta curta
  'long_text',     -- Resposta longa
  'single_choice', -- Escolha única (radio)
  'multi_choice',  -- Múltipla escolha (checkbox)
  'dropdown',      -- Lista suspensa
  'date',          -- Data
  'number',        -- Número
  'scale',         -- Escala
  'boolean'        -- Sim/Não
);

create table form_questions (
  id           uuid          default uuid_generate_v4() primary key,
  template_id  uuid          references form_templates(id) on delete cascade not null,
  section_id   uuid          references form_sections(id) on delete cascade,
  type         question_type not null,
  title        text          not null,
  description  text,
  help_text    text,
  is_required  boolean       default false,
  sort_order   int           default 0,
  -- Para tipo 'scale': min, max, step
  scale_min    int           default 1,
  scale_max    int           default 10,
  scale_step   int           default 1,
  created_at   timestamptz   default now()
);

alter table form_questions enable row level security;

create policy "form_questions: via template"
  on form_questions for all
  using (
    exists (
      select 1 from form_templates t
      where t.id = form_questions.template_id
        and (t.is_system = true or t.psychologist_id = auth.uid())
    )
  );

create index idx_form_questions_template on form_questions (template_id, sort_order);
create index idx_form_questions_section on form_questions (section_id, sort_order);

-- ─── Question Options (para single_choice, multi_choice, dropdown) ─────
create table form_question_options (
  id           uuid        default uuid_generate_v4() primary key,
  question_id  uuid        references form_questions(id) on delete cascade not null,
  label        text        not null,
  sort_order   int         default 0,
  created_at   timestamptz default now()
);

alter table form_question_options enable row level security;

create policy "form_question_options: via question"
  on form_question_options for all
  using (
    exists (
      select 1 from form_questions q
      join form_templates t on t.id = q.template_id
      where q.id = form_question_options.question_id
        and (t.is_system = true or t.psychologist_id = auth.uid())
    )
  );

create index idx_fqo_question on form_question_options (question_id, sort_order);

-- ─── Form Submissions ────────────────────────────────────────
-- Cada envio de formulário para um paciente
create type submission_status as enum (
  'pending',      -- não aberto
  'in_progress',  -- em preenchimento
  'completed',    -- concluído
  'expired'       -- prazo expirado
);

create table form_submissions (
  id               uuid              default uuid_generate_v4() primary key,
  psychologist_id  uuid              references profiles(id) on delete cascade not null,
  patient_id       uuid              references patients(id) on delete cascade not null,
  template_id      uuid              references form_templates(id) on delete set null,
  -- Token público seguro e imprevisível
  token            text              not null unique default encode(gen_random_bytes(32), 'hex'),
  -- Acesso
  access_password  text              not null,
  expires_at       timestamptz,
  -- Status
  status           submission_status default 'pending' not null,
  -- Mensagem personalizada para este envio
  custom_message   text,
  -- Metadados de acesso
  first_opened_at  timestamptz,
  last_opened_at   timestamptz,
  completed_at     timestamptz,
  -- Snapshot imutável da estrutura do formulário (JSON)
  snapshot         jsonb             not null,
  created_at       timestamptz       default now(),
  updated_at       timestamptz       default now()
);

alter table form_submissions enable row level security;

-- Psicólogo vê/cria os seus
create policy "form_submissions: own"
  on form_submissions for all
  using (auth.uid() = psychologist_id);

-- Acesso público por token (sem autenticação) — via service_role ou anon
-- O controle de acesso (senha, expiração) é feito na camada de aplicação
create policy "form_submissions: public read by token"
  on form_submissions for select
  using (true);  -- filtrado por token na query; RLS não bloqueia select anon

create index idx_form_submissions_psychologist on form_submissions (psychologist_id);
create index idx_form_submissions_patient on form_submissions (patient_id);
create index idx_form_submissions_token on form_submissions (token);
create index idx_form_submissions_status on form_submissions (psychologist_id, status);
create index idx_form_submissions_expires on form_submissions (expires_at) where expires_at is not null;

-- ─── Form Responses (respostas por pergunta) ─────────────────
-- Imutáveis após conclusão; referenciamos o question_id do snapshot
create table form_responses (
  id             uuid        default uuid_generate_v4() primary key,
  submission_id  uuid        references form_submissions(id) on delete cascade not null,
  -- ID da pergunta conforme snapshot (pode não existir mais no template)
  question_id    uuid        not null,
  -- Resposta em texto; para multi_choice usa JSONB
  answer_text    text,
  answer_options jsonb,       -- array de option labels/ids para multi_choice
  answer_number  numeric,
  answer_date    date,
  answer_boolean boolean,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (submission_id, question_id)
);

alter table form_responses enable row level security;

-- Psicólogo lê as respostas das suas submissões
create policy "form_responses: via submission own"
  on form_responses for all
  using (
    exists (
      select 1 from form_submissions s
      where s.id = form_responses.submission_id
        and s.psychologist_id = auth.uid()
    )
  );

-- Acesso público para escrita (paciente respondendo)
create policy "form_responses: public upsert"
  on form_responses for insert
  using (true)
  with check (true);

create policy "form_responses: public update"
  on form_responses for update
  using (true)
  with check (true);

create index idx_form_responses_submission on form_responses (submission_id);
create index idx_form_responses_question on form_responses (submission_id, question_id);

-- ─── Form Audit Log ──────────────────────────────────────────
create table form_audit_logs (
  id             uuid        default uuid_generate_v4() primary key,
  submission_id  uuid        references form_submissions(id) on delete cascade not null,
  event          text        not null,  -- 'created', 'opened', 'answer_saved', 'completed', 'expired', 'access_denied'
  metadata       jsonb,
  ip_address     text,
  user_agent     text,
  created_at     timestamptz default now()
);

alter table form_audit_logs enable row level security;

create policy "form_audit_logs: own"
  on form_audit_logs for select
  using (
    exists (
      select 1 from form_submissions s
      where s.id = form_audit_logs.submission_id
        and s.psychologist_id = auth.uid()
    )
  );

-- Insert público (para registrar eventos do paciente)
create policy "form_audit_logs: public insert"
  on form_audit_logs for insert
  with check (true);

create index idx_form_audit_submission on form_audit_logs (submission_id, created_at desc);

-- ─── updated_at triggers ─────────────────────────────────────
create trigger trg_form_templates_updated_at
  before update on form_templates
  for each row execute function update_updated_at();

create trigger trg_form_submissions_updated_at
  before update on form_submissions
  for each row execute function update_updated_at();

create trigger trg_form_responses_updated_at
  before update on form_responses
  for each row execute function update_updated_at();

-- ─── Função: expirar submissions automaticamente ─────────────
create or replace function expire_form_submissions()
returns void language plpgsql security definer as $$
begin
  update form_submissions
  set status = 'expired', updated_at = now()
  where status in ('pending', 'in_progress')
    and expires_at is not null
    and expires_at < now();
end;
$$;
