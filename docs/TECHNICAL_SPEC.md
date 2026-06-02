# Luka — Especificação Técnica e Regras de Negócio

> Guia completo para desenvolvedores. Cobre arquitetura, schema do banco, regras de negócio, fluxos de produto e decisões técnicas.

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Arquitetura](#2-arquitetura)
3. [Schema do Banco de Dados](#3-schema-do-banco-de-dados)
4. [Autenticação e Segurança](#4-autenticação-e-segurança)
5. [Perfil do Psicólogo — Regras de Negócio](#5-perfil-do-psicólogo--regras-de-negócio)
6. [Pacientes — Regras de Negócio](#6-pacientes--regras-de-negócio)
7. [Formulários Clínicos — Fluxo Completo](#7-formulários-clínicos--fluxo-completo)
8. [Roteamento e Navegação](#8-roteamento-e-navegação)
9. [Validações — Algoritmos Oficiais](#9-validações--algoritmos-oficiais)
10. [Camada de Dados](#10-camada-de-dados)
11. [Upload de Ficheiros](#11-upload-de-ficheiros)
12. [Configurações Clínicas](#12-configurações-clínicas)
13. [Deploy e Infraestrutura](#13-deploy-e-infraestrutura)
14. [Decisões Técnicas e Trade-offs](#14-decisões-técnicas-e-trade-offs)
15. [Glossário](#15-glossário)

---

## 1. Visão Geral do Produto

**Luka** é um sistema de gestão clínica exclusivo para psicólogos. Permite gerir pacientes, enviar formulários clínicos (anamneses, escalas, contratos), acompanhar sessões e manter conformidade legal (RGPD, CFP, OPP).

### Público-alvo

- Psicólogos clínicos autónomos (PT e BR)
- Clínicas de pequeno e médio porte

### Plataformas

| Plataforma | Tecnologia | URL |
|---|---|---|
| iOS | React Native + Expo Go | `exp://127.0.0.1:8081` (dev) |
| Android | React Native + Expo Go | `exp://10.0.2.2:8081` (dev) |
| Web | Expo SPA + Vercel | `https://luka-psi-mocha.vercel.app` |

---

## 2. Arquitetura

### Stack Completa

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)               │
│                                                         │
│  Expo Router v4 (file-based routing)                    │
│  NativeWind v4 (Tailwind CSS)                           │
│  TanStack Query v5 (server state + cache)               │
│  Zustand (client state: session, user, profile)         │
│  React Hook Form + Zod (forms + validation)             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST / Realtime
┌────────────────────────▼────────────────────────────────┐
│                    SUPABASE (BaaS)                       │
│                                                         │
│  PostgreSQL 15     — dados relacionais                  │
│  Auth              — email/password, JWT                │
│  Row Level Security — isolamento por psicólogo          │
│  Storage (avatars) — fotos, logos, assinaturas          │
│  Management API    — aplicar migrations                 │
└─────────────────────────────────────────────────────────┘
```

### Clientes Supabase

O projeto tem **dois clientes** Supabase distintos:

| Cliente | Arquivo | `persistSession` | Uso |
|---|---|---|---|
| `supabase` | `src/services/supabase.ts` | `true` | App autenticado (psicólogo) |
| `supabasePublic` | `src/services/supabasePublic.ts` | `false` | Rotas públicas `/f/:token` (paciente) |

**Por que dois clientes?** A rota `/f/:token` é acedida pelo paciente sem conta. Se usasse o cliente principal, a sessão do psicólogo gerava 401 ao tentar operações anónimas. O cliente público desabilita a persistência de sessão e usa apenas a `anon` key.

### Estado Global (Zustand)

```typescript
// session.store.ts
interface SessionState {
  session: Session | null      // Supabase session JWT
  user: User | null            // auth.users
  profile: Profile | null      // public.profiles (dados clínicos)
  isLoading: boolean
  isInitialized: boolean
}
```

O `profile` é carregado após login e mantido em memória durante toda a sessão. É o objeto mais consultado do app.

### Fluxo de Inicialização

```
App abre
  → RootLayout (_layout.tsx)
  → supabase.auth.onAuthStateChange()
  → Se autenticado: carrega profile → setProfile()
  → Redireciona para /(app) ou /(auth)/splash
```

---

## 3. Schema do Banco de Dados

### Diagrama de Relações

```
auth.users (Supabase Auth)
    │ 1:1
    ▼
profiles (psicólogos)
    │ 1:N         │ 1:N              │ 1:N
    ▼             ▼                  ▼
patients      form_templates    practice_locations
    │ 1:N          │ 1:N
    ▼              ▼
form_submissions  form_sections
    │ 1:N              │ 1:N
    ▼                  ▼
form_responses    form_questions
                      │ 1:N
                      ▼
                 form_question_options

-- Lookup tables (partilhadas entre psicólogos)
genders · civil_statuses · insurers · plans · countries
```

### Tabela `profiles`

Campo principal do psicólogo. `id` é FK para `auth.users(id)`.

| Coluna | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `id` | uuid | ✅ | FK → `auth.users(id)` |
| `full_name` | text | ✅ | Nome completo legal |
| `professional_name` | text | ❌ | Nome exibido aos pacientes (ex: "Ana Silva") |
| `gender_id` | uuid | ❌ | FK → `genders(id)` — define Dr./Dra. |
| `nif` | text | ❌ | UNIQUE — CPF (BR) ou NIF (PT), validado |
| `ordem_psicologos` | text | ❌ | Nº OPP ou CRP |
| `phone` | text | ❌ | |
| `avatar_url` | text | ❌ | URL no Storage bucket `avatars` |
| `logo_url` | text | ❌ | Logo para formulários |
| `signature_url` | text | ❌ | Assinatura digital |
| `address` | text | ❌ | |
| `postal_code` | text | ❌ | |
| `city` | text | ❌ | |
| `country` | text | ❌ | |
| `birth_date` | date | ❌ | |
| `patient_terminology` | text | ❌ | Default: `"Paciente"` |
| `onboarding_completed` | boolean | ✅ | Default: `false` |
| `created_at` | timestamptz | ✅ | |
| `updated_at` | timestamptz | ✅ | |

> **Nota:** `commercial_name` foi dropado na migration 012 e substituído por `professional_name`.

### Tabela `patients`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `psychologist_id` | uuid | FK → `profiles(id)` — isolamento RLS |
| `full_name` | text | Obrigatório |
| `preferred_name` | text | Nome preferido / apelido |
| `gender_id` | uuid | FK → `genders(id)` |
| `gender` | text | Campo legado — usar `gender_id` |
| `date_of_birth` | date | |
| `cpf` | text | CPF (Brasil) — validado |
| `nif` | text | NIF (Portugal) — validado |
| `email` | text | |
| `phone` | text | |
| `phone_ddi` | text | Código DDI separado |
| `civil_status_id` | uuid | FK → `civil_statuses` |
| `insurer_id` | uuid | FK → `insurers` |
| `plan_id` | uuid | FK → `plans` |
| `sns_user_number` | text | Número utente SNS (Portugal) |
| `additional_contacts` | jsonb | Array de contactos extra |
| `consent_rgpd` | boolean | |
| `consent_informed` | boolean | |
| `consent_minors` | boolean | |
| `status` | enum | `active` / `inactive` / `waiting` |
| `notes` | text | Notas clínicas privadas |

### Tabela `genders`

Tabela partilhada — qualquer psicólogo pode ler, só o autor pode modificar (+ admins).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Ex: "Feminino", "Masculino", "Não-binário" |
| `pronoun_treatment` | text | Ex: "Dra.", "Dr.", "Dr(a)." |
| `sort_order` | int | Ordenação no dropdown |
| `is_active` | boolean | |

### Tabela `form_templates`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `psychologist_id` | uuid | NULL = template de sistema |
| `title` | text | UNIQUE por psicólogo |
| `description` | text | |
| `is_system` | boolean | Templates de sistema não editáveis |
| `is_archived` | boolean | Ocultado da listagem |
| `version` | int | Versionamento |

### Tabela `form_submissions`

Representa um envio específico para um paciente.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `template_id` | uuid | FK → `form_templates` |
| `patient_id` | uuid | FK → `patients` |
| `psychologist_id` | uuid | FK → `profiles` |
| `token` | text | UNIQUE — URL pública `/f/:token` |
| `access_password` | text | Senha bcrypt — paciente precisa para aceder |
| `status` | enum | `pending` / `completed` / `expired` |
| `expires_at` | timestamptz | NULL = sem prazo |
| `custom_message` | text | Mensagem enviada ao paciente |
| `snapshot` | jsonb | **Imutável** — cópia do template no momento do envio |
| `extra_sections` | jsonb | Seções extras adicionadas no envio |
| `completed_at` | timestamptz | |

### Tabela `form_responses`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `submission_id` | uuid | FK → `form_submissions` |
| `question_id` | uuid | FK → `form_questions` |
| `response_text` | text | Para campos de texto |
| `response_json` | jsonb | Para múltipla escolha, escala, etc. |

---

## 4. Autenticação e Segurança

### Row Level Security (RLS)

**Regra fundamental:** cada psicólogo só vê e modifica os seus próprios dados.

```sql
-- Exemplo: patients
CREATE POLICY "patients_select" ON patients
  FOR SELECT USING (psychologist_id = auth.uid());

CREATE POLICY "patients_insert" ON patients
  FOR INSERT WITH CHECK (psychologist_id = auth.uid());
```

### Acesso Público a Formulários

A rota `/f/:token` é pública. O paciente não tem conta no Supabase. Para isso:

1. `form_responses` tem política especial para `anon`:
```sql
CREATE POLICY "anon_insert_responses" ON form_responses
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_submissions
      WHERE id = submission_id AND status = 'pending'
    )
  );
```

2. `form_submissions` tem SELECT público para `anon` apenas por `token`:
```sql
CREATE POLICY "anon_read_by_token" ON form_submissions
  FOR SELECT TO anon
  USING (token = current_setting('request.jwt.claim.token', true));
```

### RPC com SECURITY DEFINER

Para preview de templates (sem revelar dados de outros psicólogos):

```sql
CREATE FUNCTION get_form_template_preview(template_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- executa com privilégios do owner, não do caller
AS $$ ... $$;
```

### JWT e Sessão

- Supabase Auth emite JWTs com `role: authenticated` ou `role: anon`
- Sessão persistida em `AsyncStorage` (mobile) e `localStorage` (web)
- Expiração: 1 hora (access token) / 7 dias (refresh token)
- `onAuthStateChange` reconecta automaticamente após expiração

---

## 5. Perfil do Psicólogo — Regras de Negócio

### Nome Profissional vs. Nome Completo

| Campo | Uso |
|---|---|
| `full_name` | Nome legal completo — mostrado nas configurações |
| `professional_name` | Exibido nas mensagens aos pacientes e saudação do app |

Se `professional_name` for nulo, o app usa `full_name` como fallback.

### Prefixo Dr./Dra. (pronome de tratamento)

O prefixo é derivado do `gender_id` do psicólogo. A função `getPronounTreatment` em `src/hooks/useGenders.ts` retorna o campo `pronoun_treatment` da tabela `genders`.

```typescript
// Ex: gender.pronoun_treatment = "Dra."
const pronoun = getPronounTreatment(genders, profile.gender_id)
const displayName = `${pronoun} ${profile.professional_name ?? profile.full_name}`
// → "Dra. Ana Silva"
```

**Género é obrigatório ao salvar o perfil.** Sem género, a mensagem aos pacientes fica sem prefixo.

### NIF/CPF no Perfil

- **Obrigatório** — não é possível salvar o perfil sem NIF/CPF
- **Único** — constraint `UNIQUE` na coluna `nif` da tabela `profiles`
- **Validado** — algoritmo oficial (ver Secção 9)
- O campo aceita CPF (Brasil, 11 dígitos) **ou** NIF (Portugal, 9 dígitos)

### Alteração de E-mail e Senha

- **E-mail:** lido de `auth.users` via `supabase.auth.getUser()` — exibido como read-only no perfil. Para alterar, o utilizador deve contactar suporte (limitação da Supabase Auth — requer confirmação no novo e-mail).
- **Senha:** via tela dedicada `settings/change-password.tsx` usando `supabase.auth.updateUser({ password })`.

### Upload de Imagens (Storage)

| Imagem | Bucket | Path |
|---|---|---|
| Avatar / Foto de perfil | `avatars` | `avatars/{user_id}.jpg` |
| Logo profissional | `avatars` | `logos/{user_id}.jpg` |
| Assinatura digital | `avatars` | `signatures/{user_id}.jpg` |

Todas as imagens são públicas (URL pública via `getPublicUrl`). Upload usa `upsert: true` para substituir versões anteriores. Um `?t=<timestamp>` é adicionado à URL para forçar invalidação de cache.

---

## 6. Pacientes — Regras de Negócio

### Identificação

Cada paciente pertence a um único psicólogo (`psychologist_id`). Não há conta de utilizador para pacientes — são apenas registos no DB.

### Documentos de Identidade

Para pacientes brasileiros, usar `cpf`. Para portugueses, usar `nif`. Ambos são validados pelo algoritmo oficial (ver Secção 9). São opcionais para o paciente, mas recomendados para faturamento.

### Género

O campo `gender_id` aponta para a tabela `genders` partilhada. O campo legado `gender` (text) foi mantido por compatibilidade mas `gender_id` é o preferido.

### Status do Paciente

| Status | Significado |
|---|---|
| `active` | Activo em acompanhamento |
| `inactive` | Encerrou acompanhamento |
| `waiting` | Lista de espera |

### Terminologia

O psicólogo pode personalizar como chama os seus pacientes. O campo `patient_terminology` em `profiles` aceita: `"Paciente"` / `"Cliente"` / `"Utente"` / `"Beneficiário"` / `"Participante"` / `"Colaborador"`.

Esta terminologia substitui a palavra "Paciente" em toda a UI do app.

---

## 7. Formulários Clínicos — Fluxo Completo

### Arquitetura de Dados dos Formulários

```
form_templates          — definição do formulário (psicólogo)
    ↓ 1:N
form_sections           — agrupamentos lógicos de perguntas
    ↓ 1:N
form_questions          — perguntas individuais
    ↓ 1:N (opcional)
form_question_options   — opções para single/multi_choice e dropdown

form_submissions        — envio específico para um paciente
    ↓ SNAPSHOT           — cópia imutável do template no momento do envio
    ↓ 1:N
form_responses          — respostas do paciente
```

O **snapshot** em `form_submissions.snapshot` é crítico: garante que o psicólogo pode reler as respostas exactamente como foram apresentadas ao paciente, mesmo que o template seja modificado posteriormente.

### Tipos de Pergunta

| Tipo | Descrição | Armazenamento |
|---|---|---|
| `short_text` | Texto curto (1 linha) | `response_text` |
| `long_text` | Texto longo (multiline) | `response_text` |
| `single_choice` | Escolha única (radio) | `response_json: { id, label }` |
| `multi_choice` | Múltipla escolha | `response_json: [{ id, label }]` |
| `dropdown` | Lista suspensa | `response_json: { id, label }` |
| `boolean` | Sim/Não | `response_json: true/false` |
| `scale` | Escala numérica (ex: 1–10) | `response_json: number` |
| `date` | Data | `response_text: YYYY-MM-DD` |
| `number` | Número | `response_json: number` |

### Fluxo de Envio (7 Etapas)

```
Etapa 1 — Escolher Template
  └─ Lista todos os templates do psicólogo + sistema (não arquivados)
  └─ Selecção obrigatória para avançar

Etapa 2 — Personalizar Envio
  └─ Adicionar secções extras (apenas neste envio — não modifica o template)
  └─ Cada secção extra tem título e perguntas com tipo selecionável

Etapa 3 — Definir Senha
  └─ Mínimo 4 caracteres
  └─ Partilhada com o paciente fora do app (WhatsApp/SMS)
  └─ NÃO armazenada no texto da mensagem (segurança)

Etapa 4 — Prazo de Preenchimento
  └─ Opcional (toggle)
  └─ Se definido: data DD/MM/AAAA — obrigatoriamente futura
  └─ Após o prazo: formulário fica com status 'expired'

Etapa 5 — Mensagem ao Paciente
  └─ Texto livre com placeholders substituídos automaticamente:
     <<nome_paciente>>   → full_name do paciente
     <<nome_formulario>> → título do template
     <<nome_psicologo>>  → "Dr(a). Nome Profissional"
     <<link>>            → URL pública /f/:token
     <<senha>>           → senha de acesso (visível na mensagem)
     <<data_limite>>     → prazo formatado ou "Sem prazo definido"

Etapa 6 — Revisão
  └─ Resumo de todos os parâmetros
  └─ Pré-visualização da mensagem com dados reais
  └─ Botão "Confirmar e Enviar" → cria o registro no DB

Etapa 7 — Link Gerado
  └─ Token gerado pelo DB (random UUID)
  └─ URL: https://luka-psi-mocha.vercel.app/f/<token>
  └─ Canais de envio: WhatsApp, SMS, E-mail, Copiar mensagem
```

### Preenchimento pelo Paciente (Rota Pública)

```
Paciente acede a /f/:token
  → [token].tsx carrega submission via supabasePublic
  → Verifica status: 'pending' + não expirado
  → Mostra tela de senha
  → Paciente insere senha → verifica match
  → Renderiza formulário do snapshot (não do template — imutável)
  → Paciente preenche e submete
  → form_responses INSERT (política anon)
  → submission.status → 'completed'
  → Mensagem de agradecimento
```

### Senha de Acesso — Segurança

A senha **não é armazenada no campo `custom_message`** da submission. O placeholder `<<senha>>` na mensagem é substituído pelo valor real apenas na mensagem enviada ao paciente, mas o texto salvo no DB tem o placeholder vazio. Isso evita que a senha fique visível em logs ou UI do psicólogo após o envio.

### Templates de Sistema (10)

| # | Template | Categoria | Propósito |
|---|---|---|---|
| 1 | Anamnese de Adulto — Completa | Clínico | Avaliação inicial adultos |
| 2 | Anamnese Infantil — Para Responsáveis | Clínico | Avaliação inicial crianças |
| 3 | GAD-7 — Avaliação de Ansiedade | Escala | Diagnóstico ansiedade |
| 4 | PHQ-9 — Avaliação de Depressão | Escala | Diagnóstico depressão |
| 5 | PSS-10 — Escala de Estresse Percebido | Escala | Nível de estresse |
| 6 | BAI — Inventário de Ansiedade de Beck | Inventário | Ansiedade (Beck) |
| 7 | AUDIT — Uso de Álcool (OMS) | Triagem | Risco de alcoolismo |
| 8 | Escala de Autoestima de Rosenberg | Escala | Autoestima |
| 9 | Nota de Sessão | Pós-sessão | Registo pós-consulta |
| 10 | Contrato Terapêutico | Inicial | Acordo terapêutico |

Templates de sistema têm `psychologist_id = NULL` e `is_system = true`. Não podem ser editados ou deletados.

---

## 8. Roteamento e Navegação

### Estrutura de Rotas

```
/ (root _layout.tsx — Stack global)
├── /(auth)/
│   ├── splash          — guard + loading inicial
│   ├── login           — email + senha
│   ├── sign-up         — cadastro
│   └── onboarding      — primeiro acesso
├── /(app)/             — requer autenticação
│   ├── index           — Dashboard (Home)
│   ├── patients/
│   │   ├── index       — lista de pacientes
│   │   ├── new         — criar paciente
│   │   └── [id]/
│   │       ├── index   — ficha do paciente
│   │       └── edit    — editar paciente
│   ├── forms/
│   │   ├── index       — lista de templates
│   │   ├── send        — fluxo de envio (query: ?patientId=)
│   │   └── [templateId] — editor de template
│   └── settings/
│       ├── index       — menu de configurações
│       ├── profile     — perfil do psicólogo
│       ├── change-password
│       ├── terminology
│       ├── genders
│       ├── countries
│       ├── practice-locations
│       ├── civil-statuses
│       └── insurers
├── /f/                 — PÚBLICO (sem auth)
│   └── [token]         — formulário para paciente
└── +not-found
```

### Guard de Autenticação

O `(app)/_layout.tsx` usa `useSegments()` para proteger todas as rotas do grupo:

```typescript
const isInAppGroup = segments[0] === '(app)'
if (!isAuthenticated && isInAppGroup) {
  return <Redirect href="/(auth)/splash" />
}
```

O `splash.tsx` verifica `usePathname()` para não redirecionar rotas públicas:

```typescript
// Rotas que NÃO devem ser redirecionadas para auth
const publicPaths = ['/f/', '/login', '/sign-up']
if (publicPaths.some(p => pathname.startsWith(p))) return
```

### Problema `/f/` vs `/forms/` (Expo Router SPA)

**Problema:** No modo SPA web, o Expo Router monta todas as rotas do Stack em background. Como `(app)` vem antes de `forms` alfabeticamente, a rota privada `(app)/forms/[templateId]` era matched antes de `forms/[token]` quando o URL era `/forms/:token`. Resultado: o guard de auth ativava e redirecionava para login.

**Solução:** Mover a rota pública para `/f/[token]` (prefixo diferente). Nunca colocar rotas públicas com o mesmo prefixo de rotas privadas num SPA com Expo Router.

### Tab Bar

```
Tab 1: Home     (index.tsx)
Tab 2: Pacientes (patients/index.tsx)
Tab 3: Formulários (forms/index.tsx)
Tab 4: Agenda   (futuro — disabled)
```

Configurações **não está na tab bar** — acesso via ícone ⚙️ no header da Home.

---

## 9. Validações — Algoritmos Oficiais

### CPF (Brasil)

```typescript
function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')

  // 1. Deve ter 11 dígitos
  if (digits.length !== 11) return false

  // 2. Não pode ser sequência repetida (111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(digits)) return false

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0)
    const rem = (sum * 10) % 11
    return rem >= 10 ? 0 : rem
  }

  // 3. 1º dígito verificador: pesos 10 a 2 nos primeiros 9 dígitos
  const d1 = calcDigit(digits.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])

  // 4. 2º dígito verificador: pesos 11 a 2 nos primeiros 10 dígitos
  const d2 = calcDigit(digits.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])

  return d1 === parseInt(digits[9]) && d2 === parseInt(digits[10])
}
```

**Exemplo válido:** `529.982.247-25` → `true`
**Exemplo inválido:** `123.456.789-00` → `false`

### NIF (Portugal)

```typescript
function isValidNif(nif: string): boolean {
  const digits = nif.replace(/\D/g, '')

  // 1. Deve ter 9 dígitos
  if (digits.length !== 9) return false

  // 2. Primeiro dígito deve ser 1, 2, 3, 5, 6, 7, 8 ou 9
  // (0 = inválido; 4 = reservado; outros não atribuídos)
  if (!['1','2','3','5','6','7','8','9'].includes(digits[0])) return false

  // 3. Soma ponderada dos primeiros 8 dígitos (pesos 9 a 2)
  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * (9 - i)
  }

  // 4. Dígito verificador = 11 - (soma mod 11)
  // Se resultado >= 10, o dígito verificador é 0
  const check = 11 - (sum % 11)
  const expected = check >= 10 ? 0 : check

  return expected === parseInt(digits[8])
}
```

**Exemplo válido:** `123456789` → `true` (check digit = 9)
**Exemplo inválido:** `123456788` → `false`

### Regra no Perfil do Psicólogo

O campo `nif` no perfil aceita **CPF OU NIF** — o utilizador insere o seu documento, e o sistema testa as duas funções:

```typescript
// Em validators.ts — profileSchema
nif: z.string()
  .min(1, 'CPF ou NIF é obrigatório')
  .refine(
    (v) => isValidCpf(v) || isValidNif(v),
    { message: 'CPF ou NIF inválido. Verifique o número informado.' }
  )
```

Para pacientes, o schema usa campos separados `cpf` e `nif`, ambos opcionais mas validados se preenchidos.

### Validação de Data (DD/MM/AAAA)

```typescript
function isValidDateDDMMYYYY(value: string): boolean {
  if (!value || value.trim() === '') return true // opcional
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const d = parseInt(match[1])
  const m = parseInt(match[2])
  const y = parseInt(match[3])
  if (m < 1 || m > 12) return false
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}
```

---

## 10. Camada de Dados

### Padrão de Hook

Todos os acessos ao Supabase seguem o padrão React Query:

```typescript
// Hook de leitura
export function usePatients(filters?: PatientFilters) {
  const { userId } = useSession()
  return useQuery({
    queryKey: ['patients', userId, filters],
    queryFn: () => patientService.getAll(userId!, filters),
    enabled: !!userId,
  })
}

// Hook de mutação
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileUpdate) => profileService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
```

### Serviços

| Serviço | Responsabilidade |
|---|---|
| `profile.service.ts` | CRUD do perfil do psicólogo |
| `patients.service.ts` | CRUD de pacientes |
| `forms.service.ts` | Templates, envios, respostas, URL pública |

Cada serviço retorna `ServiceResult<T> = { data: T | null, error: string | null }` — nunca lança exceções diretamente.

### Invalidação de Cache

Após qualquer mutação, invalidar as queries relacionadas:

```typescript
// Após criar paciente → invalidar lista
queryClient.invalidateQueries({ queryKey: ['patients'] })

// Após atualizar perfil → invalidar perfil E session store
queryClient.invalidateQueries({ queryKey: ['profile'] })
useSessionStore.getState().setProfile(updatedProfile)
```

---

## 11. Upload de Ficheiros

### Fluxo de Upload

```typescript
async function pickAndUpload(bucket: string, path: string): Promise<string | null> {
  // 1. Pedir permissão à galeria
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!perm.granted) return null

  // 2. Abrir picker (crop quadrado 1:1, qualidade 0.8)
  const result = await ImagePicker.launchImageLibraryAsync({ ... })
  if (result.canceled) return null

  // 3. Fetch do blob local
  const blob = await fetch(asset.uri).then(r => r.blob())

  // 4. Upload para Supabase Storage com upsert
  await supabase.storage.from(bucket).upload(path, blob, { upsert: true })

  // 5. Retornar URL pública com cache-buster
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl + '?t=' + Date.now()
}
```

### Caminhos no Storage

```
bucket: avatars
├── avatars/{userId}.jpg      → foto de perfil
├── logos/{userId}.jpg        → logo para formulários
└── signatures/{userId}.jpg   → assinatura digital
```

O bucket `avatars` é público (não requer auth para leitura). Para imagens privadas de pacientes (futuro), criar bucket separado com políticas RLS.

---

## 12. Configurações Clínicas

### Terminologia de Pacientes

O psicólogo pode escolher como o app se refere aos seus pacientes:

| Valor | Usado em |
|---|---|
| `Paciente` | Default — Brasil |
| `Cliente` | Abordagens humanistas |
| `Utente` | Portugal / SNS |
| `Beneficiário` | Planos de saúde |
| `Participante` | Pesquisa |
| `Colaborador` | Contexto organizacional |

### Géneros/Sexo

CRUD completo. Cada entrada tem:
- `name` — Ex: "Feminino (cisgênero)"
- `pronoun_treatment` — Ex: "Dra." (usado em mensagens)
- `sort_order` — ordem no dropdown

Valores padrão inseridos na migration 007:

| Nome | Pronome |
|---|---|
| Feminino | Dra. |
| Masculino | Dr. |
| Não-binário | Dr(a). |
| Prefiro não informar | Dr(a). |

### Países e DDI

Cada país tem:
- `iso_code` — PT / BR / US
- `name` — Portugal / Brasil
- `ddi` — +351 / +55 / +1
- `document_type` — NIF / CPF / outro

Usado no picker de DDI do telefone dos pacientes.

### Locais de Prática

Consultórios e clínicas do psicólogo:
- `name`, `address`, `phone`
- `ddi` — DDI do país do local
- `commission_rate` — percentagem de comissão (para clínicas)
- `color` — cor identificadora na agenda (futuro)

---

## 13. Deploy e Infraestrutura

### Fluxo de Deploy Web

```
1. Desenvolver + testar localmente
2. git add <ficheiros>
3. git commit -m "descrição"
4. git push origin main
   ↓
5. Vercel detecta push via webhook GitHub
6. npx expo export --platform web   (~60s)
7. Saída em dist/ → CDN Vercel
8. URL de produção atualizada automaticamente
```

### Aplicar Migrations no Supabase

O Supabase CLI não funciona em redes com DNS bloqueado (sandbox de dev). Alternativa via Management API:

```javascript
// Executar no console do browser (tab do dashboard Supabase autenticado)
const token = JSON.parse(localStorage.getItem('supabase.dashboard.auth.token')).access_token

await fetch('https://api.supabase.com/v1/projects/evrwztudtfjbyhbqilxt/database/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ query: 'ALTER TABLE profiles ADD COLUMN ...' })
})
```

Ou via Chrome DevTools → Console na aba do Supabase Dashboard.

### Git Push via .command (macOS)

O sandbox Linux não tem credenciais GitHub. Solução:

1. Criar ficheiro `.command` na raiz do projeto com o script
2. Executar no Finder (duplo clique) → abre Terminal como utilizador real → usa credenciais do Keychain

```bash
#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock
git add <ficheiros>
git commit -m "mensagem"
git push origin main
echo "=== Done! ==="
```

### Variáveis de Ambiente Vercel

| Variável | Descrição |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave anon (segura para expor no cliente) |
| `EXPO_PUBLIC_APP_URL` | URL base para links públicos (`/f/:token`) |

> `EXPO_PUBLIC_APP_URL` é crítico: é usado em `forms.service.ts` para gerar a URL que vai na mensagem ao paciente. Em dev, aponta para localhost. Em prod, para o domínio Vercel.

---

## 14. Decisões Técnicas e Trade-offs

### Por que Expo Router v4 em vez de React Navigation?

File-based routing simplifica a estrutura de pastas e é padrão da comunidade Expo. A desvantagem é o comportamento SPA em web onde todas as rotas são montadas em background — requer cuidado com guards de auth.

### Por que dois clientes Supabase?

Alternativas consideradas:
- **Uma só session:** Causaria 401 quando paciente tenta inserir resposta com sessão do psicólogo ativa mas inválida para `anon` policies
- **Logout ao abrir `/f/`:** Inaceitável — psicólogo ficaria deslogado
- **Dois clientes:** Solução limpa — cliente público tem `persistSession: false` e é usado apenas em `[token].tsx`

### Por que `/f/` e não `/forms/` para rotas públicas?

Ver Secção 8. Em resumo: Expo Router SPA monta rotas por ordem alfabética. `(app)/forms/` é matched antes de `forms/[token]` quando o URL tem prefixo `/forms/`. Mover para `/f/` resolve completamente.

### Por que TanStack Query v5 em vez de SWR ou React Context?

- Cache automático com invalidação granular por `queryKey`
- `staleTime` configurável por query (ex: géneros mudam raramente → stale time alto)
- `useInfiniteQuery` para lista de pacientes (futuro)
- Devtools para debug

### Por que Zustand para session em vez de React Query?

A session/profile é acedida em centenas de componentes e não necessita de refetch automático. Zustand é síncrono e sem overhead de cache.

### Snapshot imutável nas submissions

Alternativa: referenciar apenas o `template_id` e renderizar dinamicamente. Problema: se o psicólogo edita o template após o envio, o paciente veria perguntas diferentes das que respondeu. O snapshot garante fidelidade histórica.

---

## 15. Glossário

| Termo | Definição |
|---|---|
| **Profile** | Registo do psicólogo em `public.profiles` (diferente de `auth.users`) |
| **Submission** | Envio de um formulário específico para um paciente (com token, senha, prazo) |
| **Snapshot** | Cópia imutável do template no momento do envio |
| **Token** | UUID único que identifica uma submission pública — vai na URL `/f/:token` |
| **Template de Sistema** | Formulário pré-definido pela plataforma, não editável pelo psicólogo |
| **NIF** | Número de Identificação Fiscal — Portugal (9 dígitos) |
| **CPF** | Cadastro de Pessoa Física — Brasil (11 dígitos) |
| **OPP** | Ordem dos Psicólogos Portugueses |
| **CRP** | Conselho Regional de Psicologia — Brasil |
| **RLS** | Row Level Security — mecanismo PostgreSQL de isolamento de dados por utilizador |
| **DDI** | Código de discagem direta a distância (ex: +351 Portugal, +55 Brasil) |
| **anon key** | Chave pública do Supabase — segura para expor no cliente |
| **service_role key** | Chave admin do Supabase — NUNCA expor no cliente |
| **SECURITY DEFINER** | Função SQL que executa com privilégios do owner, não do caller |
| **Pronome de tratamento** | Prefixo usado em mensagens: Dr. / Dra. / Dr(a). (derivado do género do psicólogo) |
