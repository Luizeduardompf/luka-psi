#!/bin/bash
cd "$(dirname "$0")/.."
rm -f .git/index.lock
git push origin sdkUpdating
echo ""
echo "✅ Push concluído!"
read -p "Pressione Enter para fechar..."
