# Prompt — Módulo Completo de Formulários Clínicos (Luka.app)

Cole este prompt diretamente no Claude Code (CLI) na raiz do projeto Luka.app.

---

## CONTEXTO DO PROJETO

Você está trabalhando no **Luka.app** — aplicativo mobile (iOS + Android) para psicólogos, construído com:

- **React Native + Expo ~52** com **Expo Router v4** (file-based routing)
- **Supabase** (PostgreSQL + RLS + Auth + Storage)
- **NativeWind v4** (Tailwind CSS para React Native)
- **TanStack Query v5** (`useQuery`, `useMutation`, `useQueryClient`)
- **Zustand** (store de sessão em `src/stores/session.store.ts`)
- **TypeScript strict mode**, alias `@/` → `src/`
- Componentes UI customizados: `Button` (prop `title`), `Card`, `Badge`, `Avatar`, `Input`
- Pattern: `ServiceResult<T>` → `{ data: T | null; error: string | null }`
- Theme: `theme.colors.primary = '#7C3AED'`, `background = '#F8F7FF'` (em `src/constants/theme.ts`)
- Testes: Jest 29 + ts-jest, ambiente node, mock thenable chainable para Supabase

**Estrutura de pastas relevante:**
```
app/
  (app)/
    forms/
      _layout.tsx          ← Stack layout autenticado
      index.tsx            ← Biblioteca de formulários do psicólogo
      [templateId].tsx     ← Editor de formulário (form builder)
      send.tsx             ← Fluxo de envio (7 etapas)
    patients/
      [id].tsx             ← Ficha do paciente (tem aba Formulários)
    settings/
      profile.tsx          ← Perfil do psicólogo
  forms/
    _layout.tsx            ← Stack layout público (sem auth guard)
    [token].tsx            ← Página pública de preenchimento pelo paciente
src/
  services/
    forms.service.ts       ← formsService (objeto com todos os métodos)
  hooks/
    useForms.ts            ← TanStack Query hooks para formulários
  types/
    forms.types.ts         ← Todos os tipos e enums do módulo
    database.types.ts      ← Tipos do banco (deve ser mantido sincronizado)
  components/
    forms/
      FormBuilderQuestion.tsx   ← Card expansível de pergunta no editor
      QuestionRenderer.tsx      ← Render de pergunta para preenchimento/leitura
      PatientFormsTab.tsx       ← Aba "Formulários" na ficha do paciente
      SubmissionStatusBadge.tsx ← Badge de status do formulário enviado
      QuestionTypeIcon.tsx      ← Ícone por tipo de pergunta
  __tests__/
    forms/
      types.test.ts
      snapshot.test.ts
      forms.service.test.ts
supabase/
  migrations/
    003_forms.sql          ← Schema do módulo (tabelas, RLS, triggers, funções)
    004_forms_seed.sql     ← 4 templates padrão do sistema
```

---

## O QUE JÁ EXISTE (NÃO ALTERAR A ESTRUTURA — APENAS COMPLETAR E CORRIGIR)

O módulo de formulários foi parcialmente implementado no branch `feature/custom-forms`. Existe código para:
- Schema SQL (`003_forms.sql`) com tabelas: `form_templates`, `form_sections`, `form_questions`, `form_question_options`, `form_submissions` (com `snapshot jsonb`), `form_responses`, `form_audit_logs`
- Seed (`004_forms_seed.sql`) com 4 templates de sistema
- `formsService` com métodos de CRUD, clone, validação de acesso, snapshot imutável
- Hooks TanStack Query (`useForms.ts`)
- Componentes: `QuestionRenderer`, `FormBuilderQuestion`, `PatientFormsTab`, `SubmissionStatusBadge`, `QuestionTypeIcon`
- Screens: biblioteca (`forms/index.tsx`), editor (`forms/[templateId].tsx`), envio (`forms/send.tsx`), página pública (`app/forms/[token].tsx`)
- 40 testes unitários passando

---

## O QUE DEVE SER IMPLEMENTADO / CORRIGIDO

Trabalhe de forma **completamente autônoma**. Leia cada arquivo antes de editar. Execute testes após cada grupo de mudanças. Só pare quando tudo estiver funcionando, testado e sem erros de TypeScript.

**REGRA CRÍTICA:** Não altere nada fora do escopo de formulários. Não quebre funcionalidades existentes de pacientes, sessões, agenda ou autenticação.

---

### 1. BANCO DE DADOS — Verificar e completar `supabase/migrations/003_forms.sql`

Verifique se as seguintes estruturas existem e estão corretas. Se não, adicione via migration `005_forms_fix.sql`:

**Tabela `profiles`** deve ter:
```sql
alter table profiles add column if not exists logo_url text;
```

**Tabela `form_submissions`** deve ter obrigatoriamente:
- `token text unique not null` — URL única do formulário (gerada com `encode(gen_random_bytes(16), 'hex')`)
- `access_password text not null` — senha sem criptografia (é um PIN simples)
- `expires_at timestamptz` — prazo opcional de preenchimento
- `status submission_status not null default 'pending'` — enum: `pending | in_progress | completed | expired`
- `snapshot jsonb not null` — foto imutável do formulário no momento do envio
- `custom_message text` — mensagem personalizada que foi usada no envio
- `first_opened_at timestamptz`, `last_opened_at timestamptz`, `completed_at timestamptz`

**RLS em `form_submissions`:**
```sql
-- Psicólogo lê os próprios
create policy "form_submissions: psychologist read own"
  on form_submissions for select
  using (auth.uid() = psychologist_id);

-- Acesso público por token (sem auth) para o paciente preencher
create policy "form_submissions: public read by token"
  on form_submissions for select
  using (true);  -- filtrado por token na query da aplicação

-- Apenas sistema pode inserir/atualizar (via service role ou policies específicas)
create policy "form_submissions: psychologist insert"
  on form_submissions for insert
  with check (auth.uid() = psychologist_id);

create policy "form_submissions: public update status"
  on form_submissions for update
  using (true);  -- controlado na camada de aplicação por token + senha
```

**RLS em `form_responses`:**
```sql
-- Inserção pública (paciente insere sem auth)
create policy "form_responses: public insert"
  on form_responses for insert with check (true);

-- Leitura pelo psicólogo dono
create policy "form_responses: psychologist read"
  on form_responses for select
  using (
    exists (
      select 1 from form_submissions s
      where s.id = form_responses.submission_id
        and s.psychologist_id = auth.uid()
    )
  );
```

**Função de expiração automática** (deve existir para ser chamada via cron ou trigger):
```sql
create or replace function expire_form_submissions()
returns void language plpgsql as $$
begin
  update form_submissions
  set status = 'expired'
  where status in ('pending', 'in_progress')
    and expires_at is not null
    and expires_at < now();
end;
$$;
```

---

### 2. SEEDS — Verificar e completar `supabase/migrations/004_forms_seed.sql`

O seed deve inserir **4 templates de sistema** completos e realistas (equivalentes ao que se vê em https://cliprimecare.com/app/ferramentas — "Anamnese de Adulto — Completa"):

#### Template 1: Anamnese de Adulto — Completa
Seções e perguntas típicas de uma anamnese clínica adulto completa:

- **Seção 1: Identificação** — Nome completo (short_text, obrigatório), Data de nascimento (date, obrigatório), Gênero (single_choice: Masculino/Feminino/Não-binário/Prefiro não informar, obrigatório), Estado civil (single_choice: Solteiro/Casado/Divorciado/Viúvo/União estável), Escolaridade (single_choice: Fundamental/Médio/Superior incompleto/Superior completo/Pós-graduação), Profissão (short_text), Cidade/Estado (short_text)

- **Seção 2: Queixa Principal** — Motivo da consulta (long_text, obrigatório, help: "Descreva em suas palavras o que te trouxe à terapia"), Há quanto tempo sente isso? (short_text), O que aconteceu para procurar ajuda agora? (long_text)

- **Seção 3: Histórico de Saúde Mental** — Já fez terapia antes? (boolean, obrigatório), Se sim, por quanto tempo e por qual motivo? (long_text), Já recebeu diagnóstico psicológico ou psiquiátrico? (boolean), Se sim, qual diagnóstico? (long_text), Faz uso de medicação psiquiátrica? (boolean), Se sim, qual medicação e dosagem? (short_text)

- **Seção 4: Histórico Médico** — Tem alguma condição médica diagnosticada? (long_text), Faz uso de outros medicamentos? (long_text), Tem alergias? (short_text), Dorme bem? Quantas horas por noite? (long_text), Como está seu apetite? (single_choice: Bom/Regular/Ruim/Muito alterado)

- **Seção 5: Histórico Familiar** — Com quem você mora? (short_text), Relate brevemente sua relação com sua família de origem (long_text), Histórico de doenças mentais na família? (boolean), Relate se houver (long_text), Tem filhos? (boolean, obrigatório)

- **Seção 6: Contexto Social e de Vida** — Como é sua vida social? (long_text), Tem hobbies ou atividades de lazer? (long_text), Como está sua vida profissional? (long_text), Como você avalia seu nível de estresse atual? (scale, min=0, max=10, step=1, obrigatório), O que você espera da terapia? (long_text, obrigatório)

`send_message` padrão: `"Olá <<nome_paciente>>, tudo bem? Seguem as instruções para preencher sua anamnese.\n\nAcesse o link abaixo e utilize a senha informada para acessar o formulário «<<nome_formulario>>».\n\nSenha de acesso: <<senha>>\n\nQualquer dúvida, estou à disposição."`

#### Template 2: Anamnese Infantil (responsável)
Voltado para pais/responsáveis de crianças:

- **Seção 1: Dados da Criança** — Nome completo da criança (short_text, obrigatório), Data de nascimento (date, obrigatório), Gênero (single_choice), Escola/série (short_text), Nome do responsável (short_text, obrigatório), Parentesco (single_choice: Mãe/Pai/Avó/Avô/Tutor/Outro)

- **Seção 2: Motivo da Consulta** — Por que está buscando atendimento para a criança? (long_text, obrigatório), Há quanto tempo observa essas dificuldades? (short_text), Quem sugeriu buscar ajuda psicológica? (single_choice: Escola/Médico/Família/Decisão própria/Outro)

- **Seção 3: Desenvolvimento** — A gestação foi de risco? (boolean), Houve complicações no parto? (boolean), A criança teve marcos de desenvolvimento dentro do esperado? (boolean), Relate (long_text), A criança foi amamentada? Por quanto tempo? (short_text)

- **Seção 4: Saúde** — A criança tem alguma condição médica? (long_text), Faz uso de medicamento? (boolean), Se sim, qual? (short_text), Dorme bem? Quantas horas? (long_text), Come bem? (boolean)

- **Seção 5: Escola e Social** — Como vai o desempenho escolar? (single_choice: Ótimo/Bom/Regular/Abaixo do esperado), A criança tem amigos? (boolean), Sofreu ou sofre bullying? (boolean), Relate situações relevantes (long_text)

- **Seção 6: Família** — Os pais são separados? (boolean), Como é a relação da criança com cada responsável? (long_text), Houve eventos traumáticos recentes? (long_text), Há outras crianças em casa? (boolean)

#### Template 3: Avaliação de Ansiedade (GAD-7 adaptado)
Escala clínica para triagem de ansiedade:

- **Instruções** (seção descritiva) — Nos últimos 14 dias, com que frequência você foi incomodado pelos seguintes problemas? (escala: 0=Nenhuma vez, 1=Vários dias, 2=Mais da metade dos dias, 3=Quase todos os dias)

- **Seção 1: Sintomas** — Sentiu-se nervoso, ansioso ou no limite? (scale 0-3, obrigatório), Não conseguiu parar ou controlar as preocupações? (scale 0-3, obrigatório), Preocupou-se demais com diferentes coisas? (scale 0-3, obrigatório), Teve dificuldade para relaxar? (scale 0-3, obrigatório), Ficou tão agitado que ficou difícil ficar parado? (scale 0-3, obrigatório), Ficou facilmente irritado ou irritável? (scale 0-3, obrigatório), Sentiu medo como se algo terrível fosse acontecer? (scale 0-3, obrigatório)

- **Seção 2: Impacto** — Se você assinalou algum dos problemas acima, qual o nível de dificuldade que esses problemas causaram no seu trabalho, relações ou vida social? (single_choice: Nenhuma dificuldade/Algumas dificuldades/Muitas dificuldades/Dificuldades extremas, obrigatório), Observações adicionais (long_text)

#### Template 4: Avaliação de Depressão (PHQ-9 adaptado)
Escala clínica para triagem de depressão:

- **Seção 1: Sintomas** (mesma lógica 0-3) — Pouco interesse ou prazer em fazer as coisas (scale 0-3), Sentiu-se para baixo, deprimido ou sem esperança (scale 0-3), Dificuldade para adormecer, continuar dormindo ou dormiu demais (scale 0-3), Sentiu-se cansado ou com pouca energia (scale 0-3), Falta de apetite ou comeu demais (scale 0-3), Sentiu-se mal consigo mesmo — ou que é um fracasso (scale 0-3), Dificuldade para se concentrar nas coisas (scale 0-3), Lentidão ou agitação tão grande que outras pessoas podem ter notado (scale 0-3), Pensamentos de que seria melhor estar morto ou de se machucar (scale 0-3, obrigatório)

- **Seção 2: Impacto** — Qual o nível de dificuldade que esses problemas causaram? (single_choice, obrigatório), Algo mais que queira compartilhar? (long_text)

**Todos os templates de sistema devem ter `is_system = true` e `psychologist_id = null`.**

---

### 3. SERVIÇO — `src/services/forms.service.ts`

Leia o arquivo existente e verifique se **todos** os seguintes métodos estão implementados corretamente:

#### Métodos de Templates
- `listTemplates(psychologistId)` → sistema + próprios, ordenados por `sort_order`
- `getTemplateWithDetails(templateId)` → template + seções + perguntas + opções
- `createTemplate(psychologistId, input)` → insere, `is_system=false`
- `updateTemplate(templateId, input)` → bloqueia se `is_system=true`
- `cloneTemplate(sourceId, psychologistId, newTitle?)` → copia estrutura completa (seções, perguntas, opções), `is_system=false`, `cloned_from_id=sourceId`
- `deleteTemplate(templateId)` → bloqueia se `is_system=true`; verifica se há submissions

#### Métodos de Seções
- `createSection(templateId, input)` → insere em `form_sections`
- `updateSection(sectionId, input)` → atualiza título/descrição/sort_order
- `deleteSection(sectionId)` → cascade deleta perguntas

#### Métodos de Perguntas
- `createQuestion(templateId, sectionId, input)` → insere em `form_questions`
- `updateQuestion(questionId, input)` → atualiza campos
- `deleteQuestion(questionId)` → cascade deleta opções
- `reorderQuestions(questions: {id, sort_order}[])` → batch update

#### Métodos de Opções
- `addOption(questionId, label)` → insere em `form_question_options`
- `updateOption(optionId, label)` → atualiza label
- `deleteOption(optionId)` → remove
- `reorderOptions(options: {id, sort_order}[])` → batch update

#### Método de Envio (crítico)
```typescript
sendForm(psychologistId: string, input: SendFormInput): Promise<ServiceResult<FormSubmission>>
```
- `input` deve conter: `patient_id`, `template_id`, `password`, `expires_at?`, `custom_message?`, `extra_sections?` (seções/perguntas adicionais apenas para esse paciente)
- Busca o template com detalhes (`getTemplateWithDetails`)
- Chama `buildSnapshot(template, custom_message, expires_at, extra_sections)` para criar o snapshot imutável
- Insere em `form_submissions` com `token = encode(gen_random_bytes(16), 'hex')` gerado pelo banco (ou UUID v4 se não disponível)
- Registra em `form_audit_logs`: `{ action: 'sent', submission_id, psychologist_id, metadata: { patient_id } }`
- Retorna a submission criada

#### Método de Acesso Público
```typescript
validateAccess(token: string, password: string): Promise<{
  valid: boolean
  reason?: 'not_found' | 'wrong_password' | 'expired' | 'completed' | 'not_yet'
  submission?: FormSubmission
}>
```
- Busca submission por token (sem auth)
- Verifica senha (comparação direta, sem hash)
- Verifica `expires_at`: se passou → atualiza status para `expired`, retorna `reason: 'expired'`
- Verifica `status === 'completed'` → retorna `reason: 'completed'`
- Se tudo ok: atualiza `first_opened_at` (se null), `last_opened_at = now()`, `status = 'in_progress'`
- Registra audit log: `{ action: 'accessed' }`

#### Métodos de Respostas
```typescript
saveResponse(input: SubmitResponseInput): Promise<ServiceResult<FormResponse>>
```
- Verifica status da submission: se `completed` → retorna erro
- Faz upsert em `form_responses` por `(submission_id, question_id)`

```typescript
completeSubmission(submissionId: string, responses: FormResponse[]): Promise<ServiceResult<FormSubmission>>
```
- Busca a submission com snapshot
- Valida que todas as perguntas `is_required=true` do snapshot têm resposta não-vazia em `responses`
- Se faltar: retorna erro com lista de perguntas faltando
- Atualiza: `status = 'completed'`, `completed_at = now()`
- Registra audit log: `{ action: 'completed' }`

#### Métodos de Leitura
- `listSubmissionsForPatient(patientId, psychologistId)` → lista com status
- `getSubmissionWithResponses(submissionId)` → submission + respostas + perfil do psicólogo
- `getSubmissionByToken(token)` → acesso público sem auth
- `getPsychologistPublicProfile(psychologistId)` → `{ full_name, logo_url }`

#### Upload de Logo
```typescript
uploadLogo(psychologistId: string, uri: string): Promise<ServiceResult<string>>
```
- Usa `supabase.storage.from('avatars').upload(...)` com o arquivo do URI
- Atualiza `profiles.logo_url`
- Retorna a URL pública

#### Utilitário
```typescript
buildPublicUrl(token: string): string
// Retorna: `https://app.luka.com.br/forms/${token}`
// OU deep link: `luka://forms/${token}` (configurável via constante)
```

---

### 4. HOOKS — `src/hooks/useForms.ts`

Verifique e complete todos os hooks TanStack Query:

```typescript
// Query keys
const formKeys = {
  templates: (psychologistId: string) => ['forms', 'templates', psychologistId],
  templateDetail: (id: string) => ['forms', 'template', id],
  submissions: (patientId: string) => ['forms', 'submissions', patientId],
  submissionDetail: (id: string) => ['forms', 'submission', id],
}

// Hooks de templates
useFormTemplates()                    // lista templates (sistema + próprios)
useFormTemplateDetail(templateId)     // template com seções/perguntas/opções
useCreateTemplate()                   // mutation + invalidate templates
useUpdateTemplate()                   // mutation + invalidate template + templates
useCloneTemplate()                    // mutation + invalidate templates
useDeleteTemplate()                   // mutation + invalidate templates

// Hooks de estrutura
useCreateSection()                    // mutation + invalidate templateDetail
useUpdateSection()                    // mutation + invalidate templateDetail
useDeleteSection()                    // mutation + invalidate templateDetail
useCreateQuestion()                   // mutation + invalidate templateDetail
useUpdateQuestion()                   // mutation + invalidate templateDetail
useDeleteQuestion()                   // mutation + invalidate templateDetail
useAddOption()                        // mutation + invalidate templateDetail
useUpdateOption()                     // mutation + invalidate templateDetail
useDeleteOption()                     // mutation + invalidate templateDetail

// Hooks de envio e submissão
useSubmissionsForPatient(patientId)   // lista submissions do paciente
useSubmissionDetail(submissionId)     // submission + respostas
useSendForm()                         // mutation de envio

// Hooks de respostas (uso público, sem auth)
useSaveResponse()                     // mutation de auto-save
useCompleteSubmission()               // mutation de conclusão

// Hook de logo
useUpdateLogo()                       // mutation de upload de logo
```

---

### 5. TELA: BIBLIOTECA DE FORMULÁRIOS — `app/(app)/forms/index.tsx`

Deve funcionar como a tela principal do módulo. Requisitos:

- **Header** com título "Formulários" e botão "+" para criar novo
- **Seção "Modelos do Sistema"**: lista os templates com `is_system=true` em cards, cada um com:
  - Título, descrição, ícone, número de perguntas
  - Botão "Clonar" (ação: `cloneTemplate` → navega para o editor do clone)
  - Badge "Sistema" em roxo claro
- **Seção "Meus Formulários"**: lista templates do psicólogo logado
  - Cada card: título, número de perguntas, data de criação
  - Botão "Editar" → navega para `forms/[templateId]`
  - Botão "Excluir" com confirmação (`Alert.alert`)
  - Se `cloned_from_id` presente: badge "Clonado" discreto
- **Criar novo**: modal ou bottom sheet com campo para título e descrição opcional
- **Busca**: campo de busca que filtra ambas as listas por título
- **Estado vazio**: se nenhum formulário próprio, mostra CTA "Clone um modelo ou crie do zero"

---

### 6. TELA: EDITOR DE FORMULÁRIO — `app/(app)/forms/[templateId].tsx`

Editor estilo Google Forms. Requisitos completos:

#### Header do Formulário
- Campo editável: **nome do formulário** (grande, editável inline ou via modal)
- Campo editável: **descrição do formulário** (opcional)
- Campo editável: **mensagem padrão de envio** (texto com placeholders: `<<nome_paciente>>`, `<<nome_formulario>>`, `<<senha>>`, `<<link>>`)
  - Mostrar legenda dos placeholders disponíveis
- Se `is_system=true`: tudo read-only com banner "Este é um modelo do sistema. Clone-o para personalizar."

#### Gerenciar Seções
- Botão "+ Adicionar Seção" no final
- Cada seção mostra: título (editável), descrição (editável, opcional), e as perguntas da seção
- Botão de excluir seção (com confirmação)
- Reordenação de seções (drag-and-drop ou botões ↑↓)

#### Gerenciar Perguntas (dentro de cada seção)
- Botão "+ Adicionar Pergunta" no final de cada seção
- Cada pergunta usa o componente `FormBuilderQuestion` que deve ter:
  - Campo de título da pergunta (editável)
  - Seletor de tipo: `short_text` | `long_text` | `single_choice` | `multi_choice` | `date` | `number` | `scale` | `boolean`
  - Toggle "Obrigatória"
  - Campo de descrição/help text (opcional)
  - Se tipo `single_choice` ou `multi_choice`: lista de opções (cada uma editável, com botão de remover, botão "+ Adicionar opção")
  - Se tipo `scale`: campos min, max, step (defaults: 0, 10, 1)
  - Botão de excluir pergunta (com confirmação)
  - Reordenação ↑↓

#### Ações
- Salvar automaticamente com debounce de 1500ms em cada campo editado
- Indicador de "Salvando..." / "Salvo" no header
- Botão "Pré-visualizar" que abre `WebView` ou navega para preview HTML

---

### 7. FLUXO DE ENVIO — `app/(app)/forms/send.tsx`

7 etapas com barra de progresso. Parâmetro de rota: `?patientId=...`

**Etapa 1 — Escolher Formulário**
- Lista todos os templates (sistema + próprios) com cards clicáveis
- Mostra título, descrição, número de perguntas
- Seleção visual (borda roxa quando selecionado)

**Etapa 2 — Personalizar para este Paciente (opcional)**
- Botão "+ Adicionar seção extra" para incluir perguntas específicas para este paciente
- Essas perguntas entram em `extra_sections` no `SendFormInput` e NÃO alteram o template original
- Podem ser adicionadas/removidas livremente
- Interface igual ao editor (título da seção, perguntas com tipo e obrigatoriedade)

**Etapa 3 — Definir Senha**
- Campo senha (sem máscara, sem obscurecer)
- Label: "Senha de acesso ao formulário"
- Helper: "Esta senha será enviada ao paciente e é necessária para acessar o formulário"
- Validação: mínimo 4 caracteres

**Etapa 4 — Prazo de Preenchimento (opcional)**
- Toggle "Definir prazo de preenchimento"
- Se ativo: date picker para `expires_at`
- Helper: "Após esta data, o formulário ficará inacessível"

**Etapa 5 — Mensagem ao Paciente**
- Exibe a `send_message` padrão do template, com os placeholders substituídos:
  - `<<nome_paciente>>` → nome real do paciente
  - `<<nome_formulario>>` → título do template
  - `<<senha>>` → senha definida na etapa 3
  - `<<link>>` → URL pública (ex: `https://app.luka.com.br/forms/TOKEN_PLACEHOLDER`)
- Campo de texto editável (o psicólogo pode personalizar a mensagem)
- Mensagem editada é salva como `custom_message` na submission
- Botões de canal:
  - **WhatsApp**: ícone verde, mostra número do paciente, abre `whatsapp://send?phone=...&text=...`
  - **SMS**: ícone azul, mostra telefone do paciente
  - **E-mail**: ícone roxo, mostra e-mail do paciente
  - **Copiar link**: copia só a URL pública com botão de cópia

**Etapa 6 — Pré-visualização**
- Renderiza uma página HTML exatamente como o paciente verá (via `WebView` ou tela nativa equivalente)
- Deve mostrar: logo do psicólogo (se houver), nome do psicólogo, nome do formulário, data de envio, prazo (se houver), todas as perguntas do snapshot com as extras
- Botão "Parece ótimo, enviar" → vai para etapa 7

**Etapa 7 — Envio e Confirmação**
- Chama `sendForm` via `useSendForm()`
- Loading state enquanto salva
- Se sucesso: mostra tela de confirmação com:
  - Ícone de check verde
  - "Formulário enviado com sucesso!"
  - Link copiável (com botão de copiar)
  - Senha gerada
  - Botões: "Copiar link", "Compartilhar via WhatsApp", "Voltar para o paciente"
- Se erro: Alert com mensagem

---

### 8. FICHA DO PACIENTE — Aba de Formulários

Arquivo: `app/(app)/patients/[id].tsx` e componente `src/components/forms/PatientFormsTab.tsx`

#### Aba Formulários na ficha do paciente
- Tab switcher entre "Informações" e "Formulários" (ou tabs múltiplas se houver mais abas)
- Botão "Enviar Formulário" → navega para `forms/send?patientId=...`

#### Lista de formulários enviados
Cada item exibe:
- Título do formulário (do snapshot)
- Badge de status colorido:
  - `pending` → cinza ("Não aberto")
  - `in_progress` → amarelo ("Em preenchimento")
  - `completed` → verde ("Concluído")
  - `expired` → vermelho ("Expirado")
- Data de envio
- Data de primeiro acesso (se houver)
- Data de conclusão (se houver)
- Prazo (se houver)

#### Ao clicar no item
Abre modal ou nova tela com:
- Header: título do formulário + status badge
- Metadados: datas, prazo
- Seções e perguntas do snapshot, com as respostas do paciente renderizadas em modo read-only pelo `QuestionRenderer`
- Se não concluído: "Nenhuma resposta registrada ainda"
- Botão "Copiar link" para reenviar
- Nenhum campo é editável (read-only total)

---

### 9. PÁGINA PÚBLICA DO PACIENTE — `app/forms/[token].tsx`

Rota sem autenticação. O paciente acessa via link.

#### Estado: loading
- Spinner centralizado enquanto valida o token

#### Estado: not_found
- Mensagem: "Este formulário não foi encontrado ou o link está incorreto."

#### Estado: expired
- Mensagem: "O prazo para preenchimento deste formulário foi encerrado."
- Data do prazo

#### Estado: completed / already_done
- Mensagem: "Você já preencheu e enviou este formulário. Obrigado!"
- Data de conclusão

#### Estado: auth (tela de senha)
- Logo do psicólogo (se houver) — centralizada no topo
- Nome do psicólogo
- Nome do formulário
- Se `expires_at`: "Por favor, responda antes do dia DD/MM/AAAA"
- Campo senha (sem máscara) com label "Senha de acesso"
- Botão "Acessar Formulário"
- Mensagem de erro se senha incorreta: "Senha incorreta. Tente novamente."

#### Estado: filling (preenchimento)
- **Header fixo**: logo do psicólogo + nome do formulário + nome do psicólogo
- Se `expires_at`: banner "Por favor, responda antes do dia DD/MM/AAAA"
- Data de envio no header
- Renderiza seções e perguntas do snapshot com `QuestionRenderer`
- **Auto-save**: ao alterar qualquer campo, salva via `saveResponse` com debounce de 1500ms
  - Indicador "Salvando..." / "Salvo" discreto
- **Validação e envio**: botão "Enviar Formulário" fixo no rodapé
  - Ao pressionar: valida perguntas obrigatórias (destacar em vermelho as não respondidas)
  - Confirmação: `Alert.alert("Confirmar envio", "Depois de enviado, não será possível alterar as respostas.", [...])`
  - Chama `completeSubmission`
  - Se sucesso: transição para estado `completed`

---

### 10. CONFIGURAÇÕES DO PSICÓLOGO — Upload de Logo

Arquivo: `app/(app)/settings/profile.tsx`

Adicionar, após os campos existentes de perfil:

**Seção "Logo Profissional"**
- Exibe a logo atual (ou placeholder com ícone de câmera se não tiver)
- Botão "Alterar Logo"
- Ao pressionar: abre `ImagePicker` (expo-image-picker) com câmera ou galeria
- Upload para Supabase Storage (bucket `avatars`, path: `logos/${psychologistId}.jpg`)
- Atualiza `profiles.logo_url` via `formsService.updateLogo()`
- A logo é exibida na página pública do formulário

Instalar se necessário: `expo-image-picker` (já presente em Expo SDK 52)

Bucket no Supabase Storage (adicionar ao migration `005_forms_fix.sql` se não existir):
```sql
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "avatars: public read"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "avatars: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "avatars: own update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid() is not null);
```

---

### 11. TIPOS TypeScript — `src/types/forms.types.ts`

Verificar e completar todos os tipos. O arquivo deve exportar:

```typescript
// Enums
type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multi_choice' | 'date' | 'number' | 'scale' | 'boolean'
type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'expired'

// Entidades base
interface FormTemplate { id, psychologist_id, title, description, send_message, is_system, is_archived, cloned_from_id, sort_order, created_at, updated_at }
interface FormSection { id, template_id, title, description, sort_order, created_at }
interface FormQuestion { id, template_id, section_id, type, title, description, help_text, is_required, sort_order, scale_min, scale_max, scale_step, created_at }
interface FormQuestionOption { id, question_id, label, sort_order, created_at }
interface FormSubmission { id, psychologist_id, patient_id, template_id, token, access_password, expires_at, status, custom_message, first_opened_at, last_opened_at, completed_at, snapshot, created_at, updated_at }
interface FormResponse { id, submission_id, question_id, answer_text, answer_options, answer_number, answer_date, answer_boolean, created_at, updated_at }
interface FormAuditLog { id, submission_id, psychologist_id, action, metadata, created_at }

// Tipos de snapshot (imutáveis, armazenados em jsonb)
interface SnapshotOption { id, label, sort_order }
interface SnapshotQuestion { id, section_id, type, title, description, help_text, is_required, sort_order, scale_min, scale_max, scale_step, options: SnapshotOption[] }
interface SnapshotSection { id, title, description, sort_order }
interface FormSnapshot { template_id, template_title, template_description, sections: SnapshotSection[], questions: SnapshotQuestion[], custom_message, expires_at, snapshotted_at }

// Joins
interface FormQuestionWithOptions extends FormQuestion { options: FormQuestionOption[] }
interface FormSectionWithQuestions extends FormSection { questions: FormQuestionWithOptions[] }
interface FormTemplateWithDetails extends FormTemplate { sections: FormSectionWithQuestions[] }
interface FormSubmissionWithDetails extends FormSubmission { responses: FormResponse[]; psychologist: { full_name: string; logo_url: string | null } }

// Inputs
interface CreateFormTemplateInput { title: string; description?: string; send_message?: string }
interface UpdateFormTemplateInput { title?: string; description?: string; send_message?: string; is_archived?: boolean; sort_order?: number }
interface CreateSectionInput { title: string; description?: string; sort_order?: number }
interface CreateQuestionInput { type: QuestionType; title: string; description?: string; help_text?: string; is_required?: boolean; sort_order?: number; scale_min?: number; scale_max?: number; scale_step?: number }
interface ExtraSectionInput { title: string; description?: string; questions: CreateQuestionInput[] }
interface SendFormInput { patient_id: string; template_id: string; password: string; expires_at?: string; custom_message?: string; extra_sections?: ExtraSectionInput[] }
interface SubmitResponseInput { submission_id: string; question_id: string; answer_text?: string | null; answer_options?: string[] | null; answer_number?: number | null; answer_date?: string | null; answer_boolean?: boolean | null }

// ServiceResult já importado de app.types.ts
// export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string }

// Constantes
const QUESTION_TYPE_LABELS: Record<QuestionType, string>
const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string>
const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string>  // cores hex
const DEFAULT_SEND_MESSAGE: string  // com todos os placeholders
```

---

### 12. TESTES — `src/__tests__/forms/`

Mantenha os 40 testes existentes passando. Adicione novos testes para cobrir:

**`forms.service.test.ts`** — adicionar casos:
- `cloneTemplate`: cria cópia com `is_system=false` e `cloned_from_id` correto
- `sendForm`: cria submission com snapshot, token e audit log
- `getSubmissionWithResponses`: retorna submission com respostas e perfil do psicólogo
- `listSubmissionsForPatient`: retorna lista ordenada por data
- `completeSubmission` com pergunta obrigatória sem resposta → erro correto
- `validateAccess` com formulário expirado → atualiza status

**`snapshot.test.ts`** — adicionar:
- Snapshot com `extra_sections` inclui as perguntas extras
- IDs extras são únicos (não colidem)
- `snapshotted_at` é string ISO válida

**Executar após cada grupo de mudanças:**
```bash
npx jest src/__tests__/forms/ --no-coverage --forceExit
npx tsc --noEmit --skipLibCheck
```

---

### 13. NAVIGATION — Verificar integração

**`app/_layout.tsx`**: deve ter `<Stack.Screen name="forms" options={{ headerShown: false }} />` para a rota pública.

**`app/(app)/_layout.tsx`**: deve ter a aba "Formulários" com ícone `document-text-outline` no tab bar.

**`app/(app)/patients/[id].tsx`**: deve ter:
- State `activeTab: 'info' | 'forms'`
- Tab switcher visual com botões "Informações" e "Formulários"
- Renderiza `<PatientFormsTab patientId={id} patientName={patient.full_name} />` quando tab ativa

---

### 14. RENDERER DE PERGUNTAS — `src/components/forms/QuestionRenderer.tsx`

Componente para renderizar perguntas tanto no preenchimento (editável) quanto na visualização (read-only).

Props:
```typescript
interface QuestionRendererProps {
  question: SnapshotQuestion
  response: Partial<FormResponse> | null
  onChange: (partial: Partial<FormResponse>) => void
  isReadOnly?: boolean
}
```

Por tipo de pergunta:
- `short_text`: `TextInput` single-line (read-only: `Text`)
- `long_text`: `TextInput` multiline (read-only: `Text`)
- `single_choice`: lista de `TouchableOpacity` com ícone radio (read-only: destaca a selecionada)
- `multi_choice`: lista de `TouchableOpacity` com ícone checkbox (read-only: destaca as selecionadas)
- `date`: `TextInput` com máscara DD/MM/AAAA (read-only: `Text`)
- `number`: `TextInput` keyboardType="numeric" (read-only: `Text`)
- `scale`: slider ou botões numéricos de min a max (read-only: destaca o valor)
- `boolean`: dois botões "Sim" / "Não" (read-only: destaca o selecionado)

Sempre exibir: título da pergunta, se obrigatória mostrar asterisco vermelho (*), descrição/help text em cinza abaixo do título.

---

### 15. PROCEDIMENTO DE EXECUÇÃO

Execute nesta ordem:

1. Leia todos os arquivos relevantes antes de qualquer edição
2. Crie/atualize `supabase/migrations/005_forms_fix.sql` com correções e adições ao schema
3. Complete/corrija `src/types/forms.types.ts`
4. Complete/corrija `src/services/forms.service.ts`
5. Complete/corrija `src/hooks/useForms.ts`
6. Complete/corrija componentes em `src/components/forms/`
7. Complete/corrija screens em `app/(app)/forms/` e `app/forms/`
8. Adicione upload de logo em `app/(app)/settings/profile.tsx`
9. Verifique integração em `app/(app)/patients/[id].tsx`
10. Execute testes: `npx jest src/__tests__/forms/ --no-coverage --forceExit`
11. Execute TypeScript: `npx tsc --noEmit --skipLibCheck`
12. Corrija todos os erros encontrados
13. Execute testes e TypeScript novamente até passar tudo
14. Faça commit: `git add -A && git commit -m "feat(forms): módulo de formulários clínicos — implementação completa"`

**Não pare até que:**
- `npx tsc --noEmit --skipLibCheck` → sem output (zero erros)
- `npx jest src/__tests__/forms/ --no-coverage --forceExit` → todos passando
- Todos os arquivos listados acima estejam implementados e funcionais

---

### REFERÊNCIAS DE STACK

```typescript
// Importações típicas de tela
import { supabase } from '@/services/supabase'
import { useSessionStore } from '@/stores/session.store'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'  // prop: title (não label)
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

// TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Expo Router
import { router, useLocalSearchParams } from 'expo-router'

// Safe area
import { useSafeAreaInsets } from 'react-native-safe-area-context'
```

```typescript
// ServiceResult pattern
type ServiceResult<T> = { data: T; error: null } | { data: null; error: string }

// Sempre use try/catch + formatSupabaseError
import { formatSupabaseError } from '@/utils/errors'
```

```typescript
// Mock Supabase para testes (padrão já estabelecido no projeto)
// Ver src/__tests__/forms/forms.service.test.ts — thenable chainable + result queue
```

**Faça tudo de forma autônoma. Não peça confirmação no meio do processo. Execute, teste, corrija, repita até concluir.**
