# Luka — Gestor para Psicólogos

App mobile (iOS + Android) para gestão clínica de psicólogos: pacientes, sessões, formulários clínicos e faturamento.

> ⚠️ **Este arquivo contém credenciais de desenvolvimento. Limpar antes de ir para produção.**

---

## Stack

- **React Native + Expo ~52** (Expo Router v4, file-based routing)
- **Supabase** (PostgreSQL + Auth + RLS + Storage)
- **NativeWind v4** (Tailwind CSS para React Native)
- **TanStack Query v5** (cache + sincronização)
- **Zod + React Hook Form** (validação)
- **Zustand** (client state)
- **TypeScript** strict mode

---

## Credenciais e Configuração

### Supabase (Projeto: luka-psi)

| Variável | Valor |
|---|---|
| Project Ref | `evrwztudtfjbyhbqilxt` |
| Project URL | `https://evrwztudtfjbyhbqilxt.supabase.co` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzIzMDEsImV4cCI6MjA5NTU0ODMwMX0.ycOFvrRyMKvyGPKHQaQrzYFX3t0AdkafVELe46Y3j9w` |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MjMwMSwiZXhwIjoyMDk1NTQ4MzAxfQ.zT6ErNabJXpsQOTNjxjTrwbL0vcaU1xyUL47vpRf54M` |
| DB Host | `db.evrwztudtfjbyhbqilxt.supabase.co` |
| DB Port | `5432` |
| DB User | `postgres` |
| DB Password | `Luka@2024Psico!` (resetada em 2026-05-31) |
| Dashboard | https://supabase.com/dashboard/project/evrwztudtfjbyhbqilxt |

### Arquivo .env

```env
EXPO_PUBLIC_SUPABASE_URL=https://evrwztudtfjbyhbqilxt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzIzMDEsImV4cCI6MjA5NTU0ODMwMX0.ycOFvrRyMKvyGPKHQaQrzYFX3t0AdkafVELe46Y3j9w
EXPO_PUBLIC_APP_ENV=development
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MjMwMSwiZXhwIjoyMDk1NTQ4MzAxfQ.zT6ErNabJXpsQOTNjxjTrwbL0vcaU1xyUL47vpRf54M
EXPO_PUBLIC_APP_URL=https://app.luka.com.br
```

---

## Estado do Banco (2026-05-31)

### Migrations Aplicadas

| Migration | Status | Descrição |
|---|---|---|
| `001_initial_schema.sql` | ✅ | profiles, patients, sessions |
| `002_extend_schema.sql` | ✅ | civil_statuses, insurers, plans, colunas extras |
| `003_forms.sql` | ✅ | Tabelas de formulários + enums |
| `004_forms_seed.sql` | ✅ | 4 templates (Anamnese Adulto, Infantil, GAD-7, PHQ-9) |
| `005_forms_fix.sql` | ✅ | RLS fixes, bucket avatars |
| `006_forms_extra_templates.sql` | ✅ | 6 templates extras |

### Tabelas (12)

`profiles` · `patients` · `civil_statuses` · `insurers` · `plans` · `form_templates` · `form_sections` · `form_questions` · `form_question_options` · `form_submissions` · `form_responses` · `form_audit_logs`

### Templates de Sistema (10)

| # | Template | Tipo |
|---|---|---|
| 1 | Anamnese de Adulto — Completa | Clínico |
| 2 | Anamnese Infantil — Para Responsáveis | Clínico |
| 3 | GAD-7 — Avaliação de Ansiedade | Escala |
| 4 | PHQ-9 — Avaliação de Depressão | Escala |
| 5 | PSS-10 — Escala de Estresse Percebido | Escala |
| 6 | BAI — Inventário de Ansiedade de Beck | Inventário |
| 7 | AUDIT — Uso de Álcool (OMS) | Triagem |
| 8 | Escala de Autoestima de Rosenberg | Escala |
| 9 | Nota de Sessão | Pós-sessão |
| 10 | Contrato Terapêutico | Inicial |

---

## Como Rodar

```bash
npm install
npx expo start
npx expo start --ios      # simulador iOS
npx expo start --android  # emulador Android
```

## Testes

```bash
npx jest          # 82 testes passando
npx jest --watch
```

---

## Módulo de Formulários

### Fluxo de Envio
1. Psicólogo escolhe template → customiza por paciente (opcional)
2. Define senha + expiração
3. Mensagem com placeholders: `<<nome_paciente>>` `<<nome_formulario>>` `<<link>>` `<<senha>>`
4. Envia via WhatsApp/SMS/Email/Cópia
5. Paciente acessa `/forms/:token`, insere senha, preenche e envia
6. Snapshot imutável salvo em `form_submissions.snapshot`

### Tipos de Pergunta
`short_text` · `long_text` · `single_choice` · `multi_choice` · `dropdown` · `date` · `number` · `scale` · `boolean`

---

## Notas Técnicas

- `expo-image-picker` **NÃO instalado** — incompatível com `expo-modules-core@2.2.3`. Logo inserida via URL na tela de perfil.
- Migrations aplicadas via API interna do Supabase Studio (não via CLI).
- Senha do DB resetada em 2026-05-31.
- RLS ativo em todas as tabelas. Acesso público a `/forms/:token` usa `anon` key.
- Conta Supabase: `luizeduardompf@gmail.com`

---

## Estrutura

```
app/
  (auth)/           # Login, cadastro, onboarding
  (app)/            # App autenticado
    index.tsx       # Dashboard
    patients/       # Lista + ficha
    forms/          # Construtor, envio, respostas
    settings/       # Perfil
  forms/[token].tsx # Página pública (sem auth)

src/
  services/         # profile, patients, forms
  stores/           # session (Zustand)
  hooks/            # useProfile, usePatients, useForms...
  types/            # database.types.ts
  utils/            # validators, format, forms.types
  __tests__/        # Jest — unit + integração + E2E

supabase/migrations/ # 001-006
```
