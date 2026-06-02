#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
git add app/\(auth\)/splash.tsx
git commit -m "fix(router): skip splash navigation when screen is not focused (deep link fix)"
git push
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
