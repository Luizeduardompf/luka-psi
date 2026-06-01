#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
echo "Working dir: $(pwd)"
echo "Branch: $(git branch --show-current 2>/dev/null)"

# Remove git locks
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock 2>/dev/null || true
echo "Locks cleared."

# Stage and commit .npmrc
git add .npmrc fix-npmrc-push.command
git commit -m "fix(vercel): add .npmrc legacy-peer-deps to fix npm install"
git push

echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
