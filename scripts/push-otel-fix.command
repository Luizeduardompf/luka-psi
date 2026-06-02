#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
git add package.json
git commit -m "fix(vercel): add @opentelemetry/api to resolve supabase Metro dependency"
git push
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
