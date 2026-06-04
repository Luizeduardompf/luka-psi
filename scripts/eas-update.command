#!/bin/bash
cd "$(dirname "$0")/.."
echo "📦 Publicando EAS Update..."
npx eas-cli update --branch main --message "fix: tab bar safe area inset no iPhone v0.1.7"
echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
