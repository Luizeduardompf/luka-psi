#!/bin/bash
cd "$(dirname "$0")/.."
rm -f .git/index.lock
git add scripts/push-sdk.command scripts/push-sdkUpdating.command 2>/dev/null
git commit --amend --no-edit 2>/dev/null || true
git push origin sdkUpdating
echo ""
echo "✅ Push sdkUpdating concluído!"
read -p "Pressione Enter para fechar..."
