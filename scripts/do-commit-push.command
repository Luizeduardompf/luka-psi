#!/bin/bash
cd "$(dirname "$0")"

# Remove git lock if exists
rm -f .git/index.lock

# Stage all changes
git add app/\(app\)/forms/send.tsx
git add app/\(app\)/index.tsx
git add "app/(app)/settings/profile.tsx"
git add "app/(app)/settings/change-password.tsx"
git add src/types/database.types.ts
git add src/utils/validators.ts
git add supabase/migrations/012_professional_name.sql

# Remove tracked .command files except essentials from index
git ls-files '*.command' | grep -v -E '^(npm-install-start|push-main|open-in-simulator|do-commit-push)\.command$' | xargs git rm --cached --ignore-unmatch 2>/dev/null

# Commit
git commit -m "fix: professional_name, CPF/NIF obrigatório, email+senha no perfil, género obrigatório

- Drop commercial_name, usar professional_name em todo o app
- NIF/CPF obrigatório e validado (algoritmo real) no profileSchema
- Profile: adicionar email de login (read-only), botão alterar senha
- Nova tela change-password.tsx via supabase.auth.updateUser
- Género obrigatório no perfil antes de salvar
- Migration 012: drop commercial_name, signature_url, UNIQUE nif
- Limpar .command files desnecessários do git
"

# Push
git push origin main
echo "=== Done! ==="
