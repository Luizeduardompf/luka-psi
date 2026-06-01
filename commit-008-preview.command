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
  "src/hooks/useGenders.ts" \
  "src/services/forms.service.ts" \
  "src/types/app.types.ts" \
  "src/types/database.types.ts" \
  "src/types/forms.types.ts" \
  "src/utils/validators.ts" \
  "supabase/migrations/007_genders.sql" \
  "supabase/migrations/008_preview_rpc.sql"

git commit -m "feat: preview público de formulário + genders + fix mensagens

- Migration 008: RPC get_form_template_preview (SECURITY DEFINER)
  Permite carregar estrutura do template sem auth para preview público
- app/f/[token].tsx: token 'preview-{id}' → modo leitura com banner
  Renderiza seções/perguntas via RPC, botão de envio desabilitado
- Migration 007: tabela genders + gender_id em profiles/patients
- useGenders + getPronounTreatment (Dr./Dra.)
- send.tsx: compilação correta de tags + data_limite + canais no step 7
- forms/index.tsx: botões Entrar e Preview
- profile.tsx: seletor gender_id + campo commercial_name
- index.tsx: greeting usa preferred_name (fix 'Dr.!' bug)
- splash.tsx: usePathname para compat web (fix deep-link)"

git push

echo ""
echo "✅ Commit e push feitos! Vercel vai fazer deploy automaticamente."
echo "   Aguarde ~1 min e teste o Preview novamente."
read -p "Pressione Enter para fechar..."
