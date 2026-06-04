#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null || true

echo "🚀 Push sdkUpdating → origin main..."
git push origin sdkUpdating:main

echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
