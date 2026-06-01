#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
echo "🔀 Merging feature/forms-vercel → main..."
git checkout main
git merge feature/forms-vercel --no-edit
echo "📤 Pushing main..."
git push origin main
echo ""
echo "✅ Done! Vercel deploy triggered."
read -p "Pressione Enter para fechar..."
