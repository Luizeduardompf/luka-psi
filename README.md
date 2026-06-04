# Luka

Plataforma para psicólogos gerenciarem:

- Pacientes
- Sessões
- Agenda
- Formulários Clínicos
- Documentos
- Acompanhamento Terapêutico

Disponível para:

- iOS
- Android
- Web

---

## Stack

- React Native
- Expo SDK 54
- TypeScript
- Expo Router
- Supabase
- TanStack Query
- Zustand
- NativeWind
- Vercel
- EAS Update

---

## Documentação

| Arquivo | Descrição |
|----------|------------|
| CLAUDE.md | Regras operacionais para agentes |
| PROJECT_CONTEXT.md | Contexto funcional do produto |
| ARCHITECTURE.md | Arquitetura e convenções |
| SUPABASE.md | Banco de dados e migrations |
| DEPLOY.md | Processo de deploy |
| ACCOUNTS.md | Contas e acessos |

---

## Instalação

### Requisitos

- Node.js 20+
- npm
- Expo CLI
- Expo Go
- iOS Simulator (opcional)
- Android Emulator (opcional)

### Instalar

```bash
git clone https://github.com/Luizeduardompf/luka-psi

cd luka-psi

npm install
```

## Configuração

Criar `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_URL=
```

Nunca commitar credenciais.

---

## Executar

### Expo

```bash
npx expo start
```

### iOS

```bash
npx expo run:ios
```

### Android

```bash
npx expo run:android
```

### Web

```bash
npx expo start --web
```

---

## Acesso pelo Celular

### Primeira Execução

Instale o aplicativo:

- iPhone: Expo Go (App Store)
- Android: Expo Go (Google Play)

Faça login no Expo Go utilizando a conta:

`luizeduardompf.lixo@gmail.com`

Abra o projeto Luka já associado à conta.

---

### Durante o Desenvolvimento

Para desenvolvimento rápido:

```bash
npx expo start
```

Utilize:

- iOS Simulator
- Android Emulator

Preferir simuladores para evitar depender de publicações remotas a cada alteração.

---

### Atualização Remota (Expo Go)

Após concluir uma funcionalidade:

```bash
npx eas-cli update --branch main --message "descrição da alteração"
```

A atualização ficará disponível no Expo Go.

Benefícios:

- sem necessidade de QR Code;
- sem necessidade da mesma rede Wi-Fi;
- sem necessidade do computador ligado;
- atualização disponível ao abrir o aplicativo no celular.

---

### Fluxo Recomendado

1. Desenvolver localmente.
2. Testar em simulador.
3. Corrigir problemas.
4. Publicar via EAS Update.
5. Validar no celular real.


---

## Versionamento

Versão da aplicação:

```text
src/constants/version.ts
```

Atualizar:

```bash
bash scripts/bump-version.sh
```

---

## Desenvolvimento

Fluxo recomendado:

1. Implementar
2. Testar localmente
3. Validar iOS
4. Validar Android
5. Commitar
6. Push GitHub
7. Validar Vercel
8. Publicar EAS Update

---

## Deploy

Consultar:

```text
DEPLOY.md
```

---

## Banco de Dados

Consultar:

```text
SUPABASE.md
```

---

## Arquitetura

Consultar:

```text
ARCHITECTURE.md
```

## Ambiente de Demonstração

As seguintes contas podem ser utilizadas para testes locais e validação funcional.

| Perfil | Email | Senha |
|----------|----------|----------|
| Psicóloga | ana.silva@luka.app | Luka1234 |
| Psicólogo | joao.silva@luka.app | Luka1234 |
| Demo Geral | demo@luka.app | Demo123456 |

### Login

1. Execute o projeto localmente.
2. Abra a tela de Login.
3. Utilize uma das contas acima.
4. Após autenticação, o usuário será redirecionado para o Dashboard.

### Observações

- Contas destinadas exclusivamente para desenvolvimento e testes.
- Não utilizar em ambiente de produção.
- Caso uma conta seja removida ou redefinida, atualizar esta documentação.
