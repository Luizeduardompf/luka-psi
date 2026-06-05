#!/bin/bash
cd "$(dirname "$0")/.."
npx eas-cli update --branch main --message "feat: profile_field questions v0.1.9"
echo ""
read -p "Pressione Enter para fechar..."
