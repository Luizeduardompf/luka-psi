#!/bin/bash
set -e
cd /Users/claudecode/Documents/Claude/Projects/Luka/Luka

echo "🔓 Removendo git locks..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock .git/packed-refs.lock
echo "✅ Locks removidos"

echo ""
echo "📦 Adicionando arquivos..."
git add \
  src/services/supabase.ts \
  src/components/forms/PatientFormsTab.tsx \
  app.json \
  vercel.json \
  .env.vercel

echo ""
echo "💾 Commitando..."
git commit -m "feat: vercel web deploy + web platform fixes

- supabase.ts: localStorage fallback for web (SecureStore is native-only)
- PatientFormsTab: web-safe clipboard (navigator.clipboard on web, react-native Clipboard on native)
- app.json: add web platform, metro bundler, single output mode
- vercel.json: SPA build config (expo export --platform web) + security headers
- .env.vercel: Vercel environment variables guide"

echo ""
echo "🚀 Fazendo push..."
git push --set-upstream origin feature/custom-forms

echo ""
echo "✅ Tudo pronto! Próximo passo:"
echo "   1. Acesse vercel.com e importe o repositório"
echo "   2. Configure as env vars conforme .env.vercel"
echo "   3. Deploy automático estará configurado"
echo ""
read -p "Pressione Enter para fechar..."
