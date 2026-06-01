#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
git add package.json
git commit -m "fix(vercel): add react-dom and react-native-web for web build"
git push
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
