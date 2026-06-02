#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

git add \
  README.md \
  "app/(app)/forms/index.tsx" \
  "app/(app)/forms/send.tsx" \
  "app/(app)/index.tsx" \
  "app/(app)/settings/profile.tsx" \
  "app/(auth)/splash.tsx" \
  "app/_layout.tsx" \
  "app/f/_layout.tsx" \
  "app/f/[token].tsx" \
  "src/services/forms.service.ts" \
  "src/types/app.types.ts" \
  "src/types/database.types.ts" \
  "src/types/forms.types.ts" \
  "src/utils/validators.ts" \
  "src/hooks/useGenders.ts" \
  "supabase/migrations/007_genders.sql"

git commit -m "feat: genders table, Dr./Dra. messages, form preview, fix send flow

- Migration 007: tabela genders (Masculino/Feminino/Não-binário/Prefiro não informar)
  + gender_id em profiles e patients + commercial_name em profiles
- useGenders hook + getPronounTreatment helper
- send.tsx: canais de envio movidos para step 7 (URL real disponível)
  + substituição correta de <<data_limite>> e <<nome_psicologo>> com Dr./Dra.
- forms/index.tsx: botões 'Entrar' e 'Preview' nos templates
- profile.tsx: seletor de gender_id + campo commercial_name
- validators.ts: commercial_name no profileSchema
- index.tsx: greeting usa preferred_name (fix 'Dr.!' bug)
- splash.tsx: useIsFocused → usePathname (web compat)
- EXPO_PUBLIC_APP_URL: corrigido para https://luka-psi-mocha.vercel.app no Vercel
- Supabase: avatar_url dos usuários de teste atualizado"

git push

echo ""
echo "✅ Commit e push feitos! Vercel vai fazer deploy automaticamente."
read -p "Pressione Enter para fechar..."
