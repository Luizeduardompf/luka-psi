#!/bin/bash
cd "$(dirname "$0")"

# Remove git locks if exist
rm -f .git/index.lock
rm -f .git/HEAD.lock
rm -f .git/COMMIT_EDITMSG.lock
rm -f .git/refs/heads/main.lock

# Stage changes
git add "app/(app)/forms/send.tsx"
git add "app/(app)/index.tsx"
git add "app/(app)/settings/profile.tsx"
git add "app/(app)/settings/change-password.tsx"
git add "src/types/database.types.ts"
git add "src/utils/validators.ts"
git add "supabase/migrations/012_professional_name.sql"

# Remove tracked .command files except essentials from index
git ls-files '*.command' | grep -v -E '^(npm-install-start|push-main|open-in-simulator)\.command$' | xargs git rm --cached --ignore-unmatch 2>/dev/null

# Commit
git commit -m "fix: professional_name, CPF/NIF obrigatorio, email+senha no perfil, genero obrigatorio

- Drop commercial_name, usar professional_name em todo o app
- NIF/CPF obrigatorio e validado (algoritmo real) no profileSchema
- Profile: adicionar email de login (read-only), botao alterar senha
- Nova tela change-password.tsx via supabase.auth.updateUser
- Genero obrigatorio no perfil antes de salvar
- Migration 012: drop commercial_name, UNIQUE nif
- Limpar .command files desnecessarios do git
"

git push origin main
echo "=== Done! ==="
