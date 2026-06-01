#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
echo "📤 Pushing main..."
git push origin main
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
