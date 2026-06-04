#!/bin/bash
cd "$(dirname "$0")/.."
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null || true
git add -A
git commit -m "fix: header do dashboard fixo fora do scroll

- Header (avatar + saudação + notificações) movido para fora do ScrollView
- Permanece visível durante scroll do conteúdo
- paddingTop respeita safe area inset

v0.1.8"
git push origin sdkUpdating:main
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
