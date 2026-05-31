#!/bin/bash
cd /Users/luizeduardompf/Documents/Projects/luka-psi 2>/dev/null || \
cd "$(find ~/Documents ~/Desktop ~/Projects -name "luka-psi" -type d 2>/dev/null | head -1)" 2>/dev/null || \
cd "$(find ~ -name ".npmrc" -path "*/luka-psi/*" 2>/dev/null | head -1 | xargs dirname)" 2>/dev/null

echo "Working dir: $(pwd)"
echo "Branch: $(git branch --show-current)"

# Remove locks if any
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

# Add and commit .npmrc
git add .npmrc
git commit -m "fix(vercel): add .npmrc legacy-peer-deps to fix npm install"
git push

echo ""
echo "✅ Done! .npmrc pushed."
read -p "Pressione Enter para fechar..."
