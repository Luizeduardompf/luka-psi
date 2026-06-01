# Luka — Gestor para Psicólogos

App mobile (iOS + Android) + web para gestão clínica de psicólogos: pacientes, sessões, formulários clínicos e faturamento.

> ⚠️ **Este arquivo contém credenciais de desenvolvimento. Limpar antes de ir para produção.**

---

## Stack

- **React Native + Expo ~52** (Expo Router v4, file-based routing, SPA mode para web)
- **Supabase** (PostgreSQL + Auth + RLS + Storage)
- **NativeWind v4** (Tailwind CSS para React Native)
- **TanStack Query v5** (cache + sincronização)
- **Zod + React Hook Form** (validação)
- **Zustand** (client state)
- **TypeScript** strict mode
- **Vercel** (deploy web SPA)

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
| SQL Editor | https://supabase.com/dashboard/project/evrwztudtfjbyhbqilxt/sql/new |

### Vercel (Deploy Web)

| Item | Valor |
|---|---|
| URL de produção | `https://luka-psi-mocha.vercel.app` |
| Dashboard | https://vercel.com/luizeduardompf3-9075s-projects/luka-psi |
| Deployments | https://vercel.com/luizeduardompf3-9075s-projects/luka-psi/deployments |
| Conta | `luizeduardompf3@gmail.com` |
| Repo GitHub conectado | `Luizeduardompf/luka-psi` (branch `main` → produção automática) |
| Build command | `npx expo export --platform web` |
| Output directory | `dist` |
| Domínio futuro | `app.luka.com.br` (CNAME → `cname.vercel-dns.com`) |

### GitHub

| Item | Valor |
|---|---|
| Repositório | https://github.com/Luizeduardompf/luka-psi |
| Branch principal | `main` |
| Conta | `luizeduardompf@gmail.com` |

### Contas de Acesso

| Serviço | Email | Notas |
|---|---|---|
| **Vercel** | `luizeduardompf3@gmail.com` | Deploy / hosting — email **diferente** |
| **Supabase** | `luizeduardompf@gmail.com` | DB, auth, storage |
| **GitHub** | `luizeduardompf@gmail.com` | Repositório |
| **Expo Go** | — | Simulador iOS + Android |

> ⚠️ Vercel usa `luizeduardompf**3**` (diferente dos outros serviços).

### Usuários de Teste (Supabase Auth)

| Email | Senha | Perfil |
|---|---|---|
| `ana.silva@luka.app` | `Luka1234` | Psicóloga principal (25 pacientes) |
| `demo@luka.app` | `Demo123456` | Usuário demo |

### Variáveis de Ambiente (.env)

```env
EXPO_PUBLIC_SUPABASE_URL=https://evrwztudtfjbyhbqilxt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzIzMDEsImV4cCI6MjA5NTU0ODMwMX0.ycOFvrRyMKvyGPKHQaQrzYFX3t0AdkafVELe46Y3j9w
EXPO_PUBLIC_APP_ENV=development
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MjMwMSwiZXhwIjoyMDk1NTQ4MzAxfQ.zT6ErNabJXpsQOTNjxjTrwbL0vcaU1xyUL47vpRf54M
EXPO_PUBLIC_APP_URL=https://luka-psi-mocha.vercel.app
```

> Nota: `EXPO_PUBLIC_APP_URL` deve apontar para a URL de produção real do Vercel (ou domínio customizado no futuro).

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

## Deploy — Vercel Web

### Como funciona

Push em `main` → Vercel detecta automaticamente → builda (`npx expo export --platform web`) → deploy em produção (~1 min).

### Como fazer deploy manual via GitHub web editor

Quando o git local está com lock ou atrás do origin, editar direto no GitHub:
1. Acesse `github.com/Luizeduardompf/luka-psi`
2. Navegue até o arquivo → clique no lápis (Edit)
3. Para injetar código JSX sem autocomplete corrupto: use `document.execCommand('insertText', false, content)` via console
4. Commit direto em `main` → Vercel faz build automaticamente

### Variáveis no Vercel

Configuradas em: Vercel → luka-psi → Settings → Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL     = https://evrwztudtfjbyhbqilxt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_APP_URL          = https://luka-psi-mocha.vercel.app
```

### vercel.json

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

O `rewrites` é crítico para o SPA: todas as rotas redirecionam para `index.html`.

---

## Roteamento Web — Notas Críticas

### Rota pública de formulários: `/f/:token`

A rota pública usa o prefixo `/f/` (não `/forms/`) para evitar conflito com a rota privada `(app)/forms/`.

| Arquivo | Rota | Acesso |
|---|---|---|
| `app/f/_layout.tsx` | `/f/*` | Público (sem auth) |
| `app/f/[token].tsx` | `/f/:token` | Público — página de preenchimento do paciente |
| `app/(app)/forms/` | `/forms/*` | Privado — construtor + envio (requer login) |
| `app/forms/[token].tsx` | `/forms/:token` | **Legado** — pode ser removido no futuro |

**Por que `/f/` e não `/forms/`?**
Expo Router SPA em modo web monta todas as rotas do Stack em background. O alfabeto ordena `(app)` antes de `forms`, fazendo a rota privada `(app)/forms/[templateId]` ser matched primeiro quando o URL é `/forms/:token`. Resultado: guard de auth ativa e redireciona para `/login`. A solução foi mover a rota pública para `/f/:token`.

### `splash.tsx` — guard de navegação

O splash usa `usePathname()` para não redirecionar quando a rota ativa é pública:

```tsx
if (pathname.startsWith('/f')) return  // não redirecionar para formulários públicos
```

O `(app)/_layout.tsx` usa `useSegments()` para não redirecionar quando não está no grupo `(app)`:

```tsx
const isInAppGroup = segments[0] === '(app)'
if (!isAuthenticated && isInAppGroup) return <Redirect href="/(auth)/splash" />
if (!isAuthenticated) return null  // rota pública — não redirecionar
```

### `useIsFocused` — incompatível com web

`useIsFocused` do `expo-router` não é exportado no bundle web. Usar `useFocusEffect` + `useCallback` ou `usePathname()` no lugar.

---

## Status dos Simuladores (2026-05-31)

| Plataforma | Estado | Usuário logado | Pacientes |
|---|---|---|---|
| **iOS Simulator** (iPhone 17 Pro) | ✅ Funcionando | `ana.silva@luka.app` | 25 (com fotos reais) |
| **Android Emulator** (Pixel API 34) | ✅ Funcionando | `ana.silva@luka.app` | 25 (com fotos reais) |
| **Vercel Web** | ✅ https://luka-psi-mocha.vercel.app | — | — |

Fotos de pacientes geradas via `randomuser.me` — função `getPatientAvatarUrl(name, gender)` em `src/utils/format.ts`.

---

## Como Rodar

```bash
npm install
npx expo start
npx expo start --ios      # simulador iOS
npx expo start --android  # emulador Android
```

### Build web local

```bash
npx expo export --platform web
# Saída em: dist/
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
5. Paciente acessa `/f/:token` (URL pública), insere senha, preenche e envia
6. Snapshot imutável salvo em `form_submissions.snapshot`

### URL pública gerada

```
https://luka-psi-mocha.vercel.app/f/<token>
```

Gerada por `buildPublicUrl(token)` em `src/services/forms.service.ts`.

### Tipos de Pergunta

`short_text` · `long_text` · `single_choice` · `multi_choice` · `dropdown` · `date` · `number` · `scale` · `boolean`

---

## Notas Técnicas

- `expo-image-picker` **NÃO instalado** — incompatível com `expo-modules-core@2.2.3` / Expo ~52. Logo inserida via URL na tela de perfil.
- Migrations aplicadas via API interna do Supabase Studio (não via CLI — DNS bloqueado no sandbox de dev).
- Senha do DB resetada em 2026-05-31.
- RLS ativo em todas as tabelas. Acesso público a `/f/:token` usa `anon` key.
- Git local pode ter `.git/index.lock` — editar direto no GitHub como alternativa.
- Build do Vercel usa `npx expo export --platform web` → saída em `dist/`.

### Como aplicar SQL no Supabase sem CLI

Via API interna do Studio (capturando headers do browser):
```
POST https://api.supabase.com/platform/pg-meta/{ref}/query?key=
Headers: authorization: Bearer {user_session_jwt}
         x-connection-encrypted: {encrypted_conn}
Body: { "query": "SQL aqui" }
```

---

## Estrutura

```
app/
  (auth)/             # Login, cadastro, onboarding, splash
  (app)/              # App autenticado (Tab Navigator)
    index.tsx         # Dashboard
    patients/         # Lista + ficha de paciente
    forms/            # Construtor, envio, respostas (privado)
    settings/         # Perfil do psicólogo
  f/
    _layout.tsx       # Layout público (sem auth)
    [token].tsx       # Página pública de preenchimento pelo paciente
  forms/
    [token].tsx       # Legado — rota pública antiga (/forms/:token)
  _layout.tsx         # Root layout (registra todas as rotas do Stack)

src/
  services/           # profile, patients, forms
  stores/             # session (Zustand)
  hooks/              # useProfile, usePatients, useForms...
  types/              # database.types.ts, forms.types.ts
  utils/              # validators, format
  __tests__/          # Jest — unit + integração + E2E

supabase/
  migrations/         # 001-006 — aplicadas no Supabase Studio

vercel.json           # Build config para Vercel
app.json              # Expo config (web.bundler: metro, output: static)
```
