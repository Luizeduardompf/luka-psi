# Luka — Gestor Clínico para Psicólogos

App mobile (iOS + Android) + web para gestão clínica de psicólogos: pacientes, sessões, formulários clínicos e faturamento.

> 📖 Para especificações técnicas detalhadas, regras de negócio e fluxos, ver [`docs/TECHNICAL_SPEC.md`](./docs/TECHNICAL_SPEC.md).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile + Web | React Native + Expo SDK 52 |
| Routing | Expo Router v4 (file-based, SPA mode web) |
| Backend | Supabase (PostgreSQL 15 + Auth + RLS + Storage) |
| Estilos | NativeWind v4 (Tailwind CSS para RN) |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| Formulários | React Hook Form + Zod |
| Tipos | TypeScript strict mode |
| Deploy web | Vercel (auto-deploy via GitHub main) |

---

## Configuração

### Pré-requisitos

- Node.js 18+
- npm 9+
- Expo Go (iOS/Android) ou simuladores
- Conta Supabase + Vercel (para deploy)

### Instalação

```bash
git clone https://github.com/Luizeduardompf/luka-psi
cd luka-psi
npm install --legacy-peer-deps
```

### Variáveis de Ambiente

Criar `.env` na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=https://evrwztudtfjbyhbqilxt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
EXPO_PUBLIC_APP_URL=https://luka-psi-mocha.vercel.app
EXPO_PUBLIC_APP_ENV=development
```

> ⚠️ Nunca commitar a `SUPABASE_SERVICE_ROLE_KEY` — usar apenas localmente para scripts de admin.

### Como Rodar

```bash
# Dev (Expo Go — iOS e Android)
npx expo start --clear

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web (SPA local)
npx expo start --web

# Build web para deploy
npx expo export --platform web
```

### Scripts .command (macOS — abrir no Finder)

| Arquivo | Ação |
|---|---|
| `npm-install-start.command` | `npm install --legacy-peer-deps` + `npx expo start --clear` |
| `open-in-simulator.command` | Abre o app no iOS Simulator via `xcrun simctl` |
| `push-main.command` | `git add` + `git commit` + `git push origin main` |

---

## Estrutura de Pastas

```
luka-psi/
├── app/
│   ├── (auth)/                    # Fluxo não autenticado
│   │   ├── splash.tsx             # Guard de navegação + loading
│   │   ├── login.tsx
│   │   ├── sign-up.tsx
│   │   └── onboarding.tsx
│   ├── (app)/                     # App autenticado (Tab Navigator)
│   │   ├── _layout.tsx            # Tab bar: Home, Pacientes, Formulários, Agenda
│   │   ├── index.tsx              # Dashboard (Home)
│   │   ├── patients/
│   │   │   ├── index.tsx          # Lista de pacientes
│   │   │   ├── new.tsx            # Novo paciente
│   │   │   └── [id]/
│   │   │       ├── index.tsx      # Ficha do paciente
│   │   │       └── edit.tsx       # Editar paciente
│   │   ├── forms/
│   │   │   ├── index.tsx          # Lista de templates
│   │   │   ├── send.tsx           # Fluxo de envio (7 etapas)
│   │   │   └── [templateId].tsx   # Editor de template
│   │   └── settings/
│   │       ├── index.tsx          # Menu de configurações
│   │       ├── profile.tsx        # Perfil do psicólogo
│   │       ├── change-password.tsx# Alterar senha
│   │       ├── terminology.tsx    # Terminologia de pacientes
│   │       ├── genders.tsx        # CRUD géneros/sexo
│   │       ├── countries.tsx      # CRUD países + DDI
│   │       ├── practice-locations.tsx  # CRUD locais de prática
│   │       ├── civil-statuses.tsx # CRUD estado civil
│   │       └── insurers.tsx       # CRUD seguradoras
│   ├── f/                         # Rotas PÚBLICAS (sem auth)
│   │   ├── _layout.tsx
│   │   └── [token].tsx            # Formulário para paciente
│   ├── _layout.tsx                # Root layout (Stack global)
│   └── +not-found.tsx
├── src/
│   ├── services/                  # Camada de acesso ao Supabase
│   │   ├── supabase.ts            # Cliente Supabase (auth persistido)
│   │   ├── supabasePublic.ts      # Cliente sem sessão (rotas /f/)
│   │   ├── profile.service.ts
│   │   ├── patients.service.ts
│   │   └── forms.service.ts
│   ├── hooks/                     # React Query hooks
│   │   ├── useAuth.ts
│   │   ├── useSession.ts
│   │   ├── useProfile.ts
│   │   ├── usePatients.ts
│   │   ├── useForms.ts
│   │   ├── useGenders.ts
│   │   ├── useSessions.ts
│   │   └── useLookups.ts
│   ├── stores/
│   │   └── session.store.ts       # Zustand: session, user, profile
│   ├── types/
│   │   ├── database.types.ts      # Tipos gerados do schema Supabase
│   │   ├── app.types.ts           # Aliases de domínio
│   │   └── forms.types.ts         # Tipos específicos de formulários
│   ├── utils/
│   │   ├── validators.ts          # Zod schemas + CPF/NIF algorithms
│   │   └── format.ts              # Formatações, máscaras, avatares
│   └── components/
│       ├── ui/                    # Button, Input, Card, Avatar, Toast...
│       ├── patients/              # PatientCard, PatientForm
│       └── forms/                 # FormBuilder, QuestionRenderer
├── supabase/
│   └── migrations/                # 001–012 — aplicadas no Supabase
├── constants/
│   └── theme.ts                   # Cores, espaçamentos, radius
├── vercel.json                    # Build + rewrites SPA
├── app.json                       # Expo config
└── TECHNICAL_SPEC.md              # Especificações técnicas completas
```

---

## Banco de Dados

### Migrations

| # | Arquivo | Conteúdo |
|---|---|---|
| 001 | `001_initial.sql` | `profiles`, `patients`, `sessions` + RLS base |
| 002 | `002_extend_schema.sql` | `civil_statuses`, `insurers`, `plans`, campos extras |
| 003 | `003_forms.sql` | `form_templates`, `form_sections`, `form_questions`, `form_submissions`, `form_responses` |
| 004 | `004_forms_seed.sql` | 4 templates de sistema (Anamnese Adulto, Infantil, GAD-7, PHQ-9) |
| 005 | `005_forms_fix.sql` | RLS fixes, bucket `avatars` no Storage |
| 006 | `006_forms_extra_templates.sql` | 6 templates adicionais (PSS-10, BAI, AUDIT, Rosenberg, Nota de Sessão, Contrato) |
| 007 | `007_genders.sql` | Tabela `genders` + `gender_id` em `profiles` e `patients` |
| 008 | `008_preview_rpc.sql` | RPC `get_form_template_preview` (SECURITY DEFINER) |
| 009 | `009_fixes_and_new_features.sql` | `countries`, `practice_locations`, `logo_url`, `signature_url`, `patient_terminology`, RLS anon para `form_responses` |
| 010 | `010_rls_countries_genders.sql` | Políticas INSERT/UPDATE/DELETE em `countries` e `genders` |
| 011 | `011_profile_birth_date.sql` | Campo `birth_date` em `profiles` |
| 012 | `012_professional_name.sql` | `professional_name` (renomear de `commercial_name`), `UNIQUE(nif)` |

### Tabelas Principais

`profiles` · `patients` · `genders` · `civil_statuses` · `insurers` · `plans` · `countries` · `practice_locations` · `form_templates` · `form_sections` · `form_questions` · `form_question_options` · `form_submissions` · `form_responses` · `form_audit_logs`

---

## Deploy

### Fluxo

```
git push origin main
    ↓
GitHub webhook → Vercel
    ↓
npx expo export --platform web   (~1 min)
    ↓
dist/ → produção automática
```

**URL de produção:** `https://luka-psi-mocha.vercel.app`

### Variáveis Vercel

Configurar em: Vercel → luka-psi → Settings → Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL      = https://evrwztudtfjbyhbqilxt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = eyJ...
EXPO_PUBLIC_APP_URL           = https://luka-psi-mocha.vercel.app
```

### `vercel.json`

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

O `rewrites` é crítico para o SPA — todas as rotas redirecionam para `index.html`.

---

## Contas e Acessos

| Serviço | Email | Notas |
|---|---|---|
| **Supabase** | `luizeduardompf@gmail.com` | Projeto `luka-psi` |
| **GitHub** | `luizeduardompf@gmail.com` | Repo `Luizeduardompf/luka-psi` |
| **Vercel** | `luizeduardompf3@gmail.com` | ⚠️ Email **diferente** dos outros |

### Usuários de Teste

| Email | Senha | Perfil |
|---|---|---|
| `ana.silva@luka.app` | `Luka1234` | Psicóloga, género Feminino, 25+ pacientes |
| `joao.silva@luka.app` | `Luka1234` | Psicólogo, género Masculino |
| `demo@luka.app` | `Demo123456` | Usuário demo genérico |

---

## Funcionalidades Implementadas

### Autenticação
- Login + cadastro com e-mail/senha (Supabase Auth)
- Onboarding obrigatório após primeiro login
- Guard de navegação no `splash.tsx` (não bloqueia rotas `/f/*`)

### Perfil do Psicólogo
- Nome completo + nome profissional (exibido nas mensagens)
- E-mail de login (read-only, via `auth.users`)
- Alteração de senha (tela dedicada)
- Foto de perfil, logo profissional, assinatura digital (upload para Storage)
- Género/Sexo (obrigatório — define prefixo Dr./Dra. em mensagens)
- NIF/CPF obrigatório, único, validado pelo algoritmo oficial
- Morada, data de nascimento, nº ordem dos psicólogos/CRP

### Pacientes
- CRUD completo com formulário extenso
- CPF (Brasil) e NIF (Portugal) com validação oficial
- Género via tabela `genders` (dropdown)
- DDI separado do telefone
- Contactos adicionais, cônjuge, tutor, contacto de emergência
- Seguradora + plano de saúde
- Consentimentos (RGPD, Informado, Menores)
- Foto de perfil (randomuser.me por nome/género)

### Formulários Clínicos
- 10 templates de sistema (Anamnese Adulto/Infantil, GAD-7, PHQ-9, PSS-10, BAI, AUDIT, Rosenberg, Nota de Sessão, Contrato Terapêutico)
- Editor de template: 9 tipos de campo
- Fluxo de envio em 7 etapas (template → personalização → senha → prazo → mensagem → revisão → link)
- Senha de acesso obrigatória (não armazenada no texto da mensagem)
- Placeholders: `<<nome_paciente>>` `<<nome_formulario>>` `<<nome_psicologo>>` `<<link>>` `<<senha>>` `<<data_limite>>`
- Envio via WhatsApp, SMS, E-mail ou cópia
- URL pública: `/f/:token` (sem autenticação)
- Snapshot imutável salvo no momento da resposta

### Configurações Clínicas
- Terminologia de pacientes (Paciente/Cliente/Utente/Beneficiário)
- CRUD de géneros/sexo com pronome de tratamento
- CRUD de países com DDI e tipo de documento
- CRUD de locais de prática
- CRUD de estado civil e seguradoras

---

## Roteamento Web — Notas Críticas

### Rota pública `/f/:token`

Usa prefixo `/f/` (não `/forms/`) para evitar conflito com `(app)/forms/`:

| Arquivo | Rota | Acesso |
|---|---|---|
| `app/f/[token].tsx` | `/f/:token` | Público (sem auth) — paciente preenche |
| `app/(app)/forms/` | `/forms/*` | Privado — psicólogo gerencia |

O Expo Router SPA ordena rotas alfabeticamente. `(app)` antes de `forms` fazia a rota privada ser matched primeiro. Solução: mover a rota pública para `/f/`.

### `splash.tsx` — guard de navegação

```tsx
// Não redirecionar para formulários públicos
if (pathname.startsWith('/f')) return
```

---

## Notas Técnicas

- **RLS ativo** em todas as tabelas. Acesso público a `/f/:token` usa `anon` key com políticas específicas.
- **`supabasePublic`**: cliente sem `persistSession` para rotas públicas — evita 401 da sessão do psicólogo.
- **Git push** via `.command` no Finder (sandbox Linux não tem credenciais GitHub).
- **Migrations** aplicadas via Management API: `POST https://api.supabase.com/v1/projects/{ref}/database/query` com `Authorization: Bearer {access_token}` do localStorage do dashboard.
- **`useIsFocused`** do expo-router não exportado no bundle web — usar `useFocusEffect` + `useCallback`.
