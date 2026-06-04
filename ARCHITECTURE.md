# ARCHITECTURE.md

## Luka.app — Arquitetura e Convenções

### Visão Geral

Luka é um aplicativo para psicólogos com foco em:

* gestão de pacientes;
* agenda;
* sessões;
* formulários clínicos;
* documentos;
* acompanhamento terapêutico.

Plataformas suportadas:

* iOS
* Android
* Web

---

## Stack Oficial

* React Native 0.81.5
* Expo SDK 54
* Expo Router v5
* React 19.1
* TypeScript (strict)
* Supabase (PostgreSQL + Auth + Storage + RLS)
* TanStack Query v5
* Zustand
* NativeWind v4
* Vercel
* EAS Update

---

## Estrutura de Pastas

### App Router

```text
app/
  _layout.tsx
  (app)/
    _layout.tsx
    dashboard/
    patients/
    sessions/
    forms/
    settings/
  forms/
```

* `(app)` = rotas autenticadas.
* `forms/` na raiz = rotas públicas sem autenticação.

### Código Fonte

```text
src/
  components/
    ui/
    forms/
    patients/
  services/
  hooks/
  stores/
  types/
  utils/
  constants/
```

---

## Navegação

Usar exclusivamente Expo Router.

### Regras

* Rotas autenticadas ficam em `app/(app)`.
* Rotas públicas ficam fora do grupo autenticado.
* Não criar navegação manual paralela.
* Usar `router.push`, `router.replace` e `useLocalSearchParams`.

Exemplo:

```ts
router.push(`/patients/${id}`)
```

---

## Estado Global

### Zustand

Responsabilidade:

* sessão do usuário;
* dados persistentes leves;
* preferências.

Arquivo principal:

```text
src/stores/session.store.ts
```

Evitar colocar dados remotos grandes no Zustand.

---

## Dados Remotos

### TanStack Query

Responsabilidade:

* cache;
* sincronização;
* loading;
* invalidação;
* mutations.

Padrão:

```ts
useQuery()
useMutation()
useQueryClient()
```

Sempre criar query keys estáveis.

Exemplo:

```ts
['patients', patientId]
```

---

## Serviços

### src/services

Toda comunicação externa deve passar por services.

Exemplos:

```text
patients.service.ts
sessions.service.ts
forms.service.ts
```

### Padrão de retorno

```ts
type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }
```

Nunca lançar erro cru para a UI.

Usar `try/catch` e normalizar mensagens.

---

## Supabase

### Auth

* Usuário autenticado = psicólogo.
* `auth.uid()` identifica o profissional.

### Banco

* RLS habilitado em todas as tabelas sensíveis.
* Policies por proprietário.
* Nunca desabilitar RLS sem necessidade explícita.

### Migrations

Todas as mudanças estruturais devem gerar migration.

Local:

```text
supabase/migrations/
```

---

## Storage

Buckets públicos apenas quando necessário.

Exemplo:

* `avatars` para logos e fotos.

Uploads sempre via service.

---

## Componentes

### src/components/ui

Componentes base reutilizáveis.

Exemplos:

* Button
* Card
* Input
* Badge
* Avatar

### Convenções

* Componentes recebem props tipadas.
* Evitar lógica de negócio pesada dentro da UI.
* Preferir composição.

---

## Estilo

### NativeWind

Usar classes utilitárias quando possível.

### Theme

Constantes em:

```text
src/constants/theme.ts
```

Não espalhar cores mágicas pelo código.

---

## Formulários Clínicos

### Rotas

```text
/app/(app)/forms/*
/app/forms/[token]
```

### Regra crítica

A rota pública é:

```text
/f/:token
```

Nunca usar:

```text
/forms/:token
```

---

## Tipagem

### src/types

Centralizar tipos compartilhados.

Arquivos principais:

```text
app.types.ts
forms.types.ts
database.types.ts
```

Manter `database.types.ts` sincronizado com o schema do Supabase.

---

## Convenções de Código

### Imports

Usar alias `@/`.

```ts
import { Button } from '@/components/ui/Button'
```

### Nomes

* Components: PascalCase
* Hooks: useSomething
* Services: somethingService
* Stores: something.store.ts

### Arquivos

* Um componente principal por arquivo.
* Evitar arquivos gigantes.
* Extrair subcomponentes quando necessário.

---

## Testes

### Ferramentas

* Jest
* ts-jest

### Local

```bash
npx jest
npx tsc --noEmit --skipLibCheck
```

### Regras

* Serviços devem ter testes.
* Fluxos críticos devem ser validados.
* TypeScript sem erros antes de concluir.

---

## Performance

Prioridades:

* evitar renders desnecessários;
* memoizar listas grandes;
* usar FlatList;
* evitar consultas repetidas;
* invalidar cache corretamente.

---

## Segurança

* Nunca commitar segredos.
* Nunca expor service role.
* Validar permissões no backend.
* Sanitizar entradas quando necessário.

---

## Deploy

Fluxo padrão:

1. Desenvolver localmente.
2. Validar em simulador.
3. Testar.
4. Commitar.
5. Push para GitHub.
6. Validar Vercel.
7. Publicar EAS Update.
8. Confirmar no Expo Go.

---

## Decisões Arquiteturais

### Por que Expo Router?

* Navegação baseada em arquivos.
* Deep links simples.
* Compatibilidade web/mobile.

### Por que TanStack Query?

* Cache automático.
* Invalidação previsível.
* Melhor UX offline/loading.

### Por que Zustand?

* Simples.
* Pequeno.
* Excelente para sessão e estado global leve.

### Por que Services?

* Separação clara entre UI e dados.
* Facilita testes.
* Facilita troca de backend no futuro.

---

## Regra de Ouro

A UI não deve conhecer detalhes do Supabase.

Tela → Hook → Service → Supabase.

Manter esse fluxo reduz acoplamento, facilita testes e preserva a arquitetura do Luka ao longo do crescimento do projeto.
