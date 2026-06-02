#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

echo "🔧 Removendo arquivos grandes do histórico git..."
git rm -r --cached .expo-go-cache/ 2>/dev/null || true
git rm -r --cached .expo/ 2>/dev/null || true

echo "📦 Adicionando arquivos do projeto..."
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

git commit -m "feat: preview público + genders + fix mensagens + clean cache

- Migration 007: tabela genders + gender_id em profiles/patients
- Migration 008: RPC get_form_template_preview (SECURITY DEFINER)
- app/f/[token].tsx: suporte a token preview-{id} com banner leitura
- formsService.getTemplatePreview: usa RPC sem auth para preview
- send.tsx: compilação correta de tags + data_limite + canais no step 7
- forms/index.tsx: botões Entrar e Preview
- profile.tsx: seletor gender_id + campo commercial_name
- index.tsx: greeting usa preferred_name (fix Dr.! bug)
- splash.tsx: usePathname para compat web"

echo ""
echo "📤 Fazendo push..."
git push

echo ""
echo "🔄 Reiniciando Expo com cache limpo..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2
npx expo start --clear &

echo ""
echo "✅ Push feito e Expo reiniciado com cache limpo!"
echo "   Aguarde o simulador reconectar (~30s)"
read -p "Pressione Enter para fechar..."
