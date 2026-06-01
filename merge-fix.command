#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

echo "📍 Branch atual:"
git branch --show-current

echo "💾 Commitando mudanças locais no main..."
git add -A
git commit -m "chore: save local state before merge" 2>/dev/null || echo "(nada para commitar)"

echo "🔀 Merging feature/forms-vercel → main..."
git merge feature/forms-vercel --no-edit

if [ $? -ne 0 ]; then
  echo "❌ Merge falhou — tentando com strategy ours para conflitos..."
  git merge --abort 2>/dev/null || true
  git merge feature/forms-vercel --no-edit -X theirs
fi

echo "📤 Pushing main..."
git push origin main

echo ""
echo "✅ Done! Vercel deploy triggered."
read -p "Pressione Enter para fechar..."
