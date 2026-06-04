#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/HEAD.lock .git/index.lock .git/refs/heads/*.lock 2>/dev/null || true
git add -A
git commit -m "fix: tab bar safe area inset no iPhone

- Usa useSafeAreaInsets para calcular altura dinâmica
- height: 56 + insets.bottom
- paddingBottom: insets.bottom + 6
- Corrige ícones cortados em iPhones com home indicator

v0.1.7"
git push
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
