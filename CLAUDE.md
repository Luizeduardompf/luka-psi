# Luka — Diretrizes do Projeto

## Stack

- **React Native + Expo SDK 52** (managed workflow)
- **Supabase** — banco, auth, storage, RLS
- **Vercel** — deploy web (SPA)
- **EAS Update** — publicação de alterações para Expo Go (iPhone)
- **GitHub** — repositório principal (`main`)

---

## ⚠️ Checklist de Deploy — Após qualquer alteração

Sempre que uma funcionalidade estiver pronta, lembrar de atualizar **todos** os destinos relevantes:

### 1. Git / GitHub
```bash
git add -A
git commit -m "descrição clara do que mudou"
git push origin main
```

### 2. Vercel (web)
- Push em `main` → Vercel faz build automático (`npx expo export --platform web`)
- Verificar deploy em: https://vercel.com/luizeduardompf3-9075s-projects/luka-psi/deployments
- URL prod: https://luka-psi-mocha.vercel.app

### 3. Expo Go / iPhone (EAS Update)
```bash
npx eas-cli update --branch main --message "descrição do que mudou"
```
- Publica nos servidores da Expo — iPhone atualiza automaticamente ao abrir o app
- Não precisa de Mac ligado nem mesma rede Wi-Fi
- Login Expo: `luizeduardompf.lixo@gmail.com` (Google)

### 4. Supabase (se houver mudanças no banco)
- Migrations via Management API (não CLI — DNS bloqueado no sandbox)
- Ver credenciais em memória: `supabase_credentials.md`
- Após migration, verificar RLS e policies

---

## Contas dos Serviços

| Serviço | Email |
|---|---|
| GitHub | `luizeduardompf@gmail.com` |
| Supabase | `luizeduardompf@gmail.com` |
| Vercel | `luizeduardompf3@gmail.com` ← diferente! |
| Expo Go / EAS | `luizeduardompf.lixo@gmail.com` (Google) |

---

## Notas Críticas

- Rota pública de formulários: `/f/:token` (NÃO `/forms/:token`)
- `eas-cli` sem sudo — usar sempre via `npx eas-cli`
- Git no sandbox tem restrições — usar `.command` files pelo Finder para commits
- `vercel.json` tem rewrite SPA — não remover
