#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Commit v0.1.6 ==="
rm -f .git/index.lock
git add -A
git commit -m "feat: v0.1.6 - histórico de versões na tela Sobre"

echo "=== Push ==="
git push origin sdkUpdating

echo "=== EAS Update ==="
npx eas-cli update --branch main --message "v0.1.6 - histórico de versões na tela Sobre"

echo ""
echo "✅ Deploy concluído!"
read -p "Pressione Enter para fechar..."
