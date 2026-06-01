#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
echo "📤 Force push..."
git push --force origin feature/forms-vercel
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
