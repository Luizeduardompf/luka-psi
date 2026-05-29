# Luka — Gestor para Psicólogos

App mobile (iOS + Android) para gestão profissional de psicólogos. Construído com React Native + Expo + Supabase.

---

## Stack

- **React Native** + **Expo SDK 52** (managed workflow)
- **TypeScript** strict mode
- **Supabase** — auth, banco de dados, RLS
- **Expo Router v4** — file-based routing
- **NativeWind v4** — Tailwind para React Native
- **React Hook Form** + **Zod** — formulários e validação
- **TanStack Query v5** — server state
- **Zustand** — client state (sessão, UI)
- **date-fns** — manipulação de datas
- **react-native-reanimated v3** — animações

---

## Pré-requisitos

- Node.js >= 18
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Conta no [Supabase](https://supabase.com) (free tier é suficiente)
- App **Expo Go** instalado no iPhone ([App Store](https://apps.apple.com/app/expo-go/id982107779))

---

## Setup

### 1. Instalar dependências

```bash
cd luka
npm install
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/migrations/001_initial.sql`
3. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public` key

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua_anon_key...
EXPO_PUBLIC_APP_ENV=development
```

> **Importante:** Variáveis com prefixo `EXPO_PUBLIC_` são expostas ao bundle do app. Use apenas a `anon key` — nunca a `service_role key`.

### 4. Iniciar o servidor de desenvolvimento

```bash
npx expo start
```

---

## Rodar no iPhone via Expo Go

1. Certifique-se de que iPhone e computador estão na **mesma rede Wi-Fi**
2. Execute `npx expo start`
3. No terminal, um **QR code** será exibido
4. Abra o app **Expo Go** no iPhone
5. Toque em **"Scan QR Code"** e escaneie o QR code
6. O app Luka abrirá diretamente no seu iPhone

> **Dica:** Se o QR code não funcionar, tente `npx expo start --tunnel` para usar um túnel público (requer `@expo/ngrok`).

---

## Estrutura do projeto

```
luka/
├── app/                          # Expo Router — rotas file-based
│   ├── (auth)/                   # Grupo de rotas não autenticadas
│   │   ├── _layout.tsx           # Auth guard + Stack navigator
│   │   ├── splash.tsx            # Splash animada
│   │   └── login.tsx             # Login + cadastro (modal)
│   ├── (app)/                    # Grupo de rotas autenticadas
│   │   ├── _layout.tsx           # Auth guard + Tab navigator
│   │   ├── index.tsx             # Dashboard
│   │   └── patients/
│   │       ├── index.tsx         # Lista de pacientes
│   │       ├── [id].tsx          # Detalhes/edição do paciente
│   │       └── new.tsx           # Novo paciente
│   └── _layout.tsx               # Root layout (providers)
├── src/
│   ├── components/ui/            # Primitivos: Button, Input, Card, Avatar, Badge
│   ├── components/patients/      # PatientCard, PatientForm
│   ├── components/layout/        # SafeContainer
│   ├── hooks/                    # useAuth, usePatients, useSession
│   ├── services/                 # supabase.ts, auth.service.ts, patients.service.ts
│   ├── stores/                   # session.store.ts (Zustand)
│   ├── types/                    # database.types.ts, app.types.ts
│   ├── utils/                    # format.ts, validators.ts, errors.ts
│   └── constants/                # theme.ts, config.ts
└── supabase/migrations/          # SQL de criação do schema
```

---

## Funcionalidades implementadas

- **Autenticação** — login e cadastro com e-mail/senha via Supabase Auth
- **Sessão persistente** — tokens armazenados com `expo-secure-store`
- **Splash screen** — animação fade + scale, redireciona conforme estado da sessão
- **Dashboard** — visão geral com contadores e pacientes recentes
- **Lista de pacientes** — busca em tempo real, filtro por status, pull-to-refresh
- **Cadastro de pacientes** — formulário completo com validação Zod, máscara de CPF/telefone, date picker
- **Detalhes do paciente** — visualização com cards, edição via modal page sheet
- **Exclusão** — confirmação antes de deletar
- **RLS** — dados isolados por psicólogo via Row Level Security no Supabase

---

## Limitações conhecidas

| Limitação | Detalhe |
|-----------|---------|
| Login social | Google OAuth não implementado — apenas e-mail/senha |
| Agenda | Tela de agenda é placeholder — será implementada em versão futura |
| Relatórios | Relatórios são placeholder — será implementado em versão futura |
| Histórico de sessões | Card placeholder na tela de detalhes do paciente |
| Upload de avatar | Campo `avatar_url` existe no banco mas upload não está implementado |
| Swipe-to-delete | Requer configuração adicional de `react-native-gesture-handler` — deletar disponível via pressão longa ou botão na tela de detalhes |
| Testes | Nenhum teste automatizado incluído nesta versão |
| Web | App não otimizado para `expo web` |

---

## Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anônima pública do Supabase |
| `EXPO_PUBLIC_APP_ENV` | Não | `development` / `staging` / `production` |

---

## Scripts disponíveis

```bash
npm start          # Inicia o dev server (Expo Go)
npm run ios        # Abre no simulador iOS (requer Xcode)
npm run android    # Abre no emulador Android (requer Android Studio)
npm run lint       # Roda ESLint
```

---

## Próximos passos sugeridos

1. **Agenda** — CRUD de sessões com calendar view
2. **Notificações** — lembretes de consultas via `expo-notifications`
3. **Relatórios** — exportação de dados em PDF
4. **Upload de foto** — avatar do psicólogo com `expo-image-picker` + Supabase Storage
5. **Login com Google** — OAuth via Supabase Auth
6. **Testes** — Jest + Testing Library
