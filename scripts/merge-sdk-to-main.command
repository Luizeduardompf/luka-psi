#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Commit final v0.1.5 ==="
rm -f .git/index.lock
git add -A
git commit -m "feat: v0.1.5 - splash Animated nativo, runtimeVersion appVersion, merge sdkUpdating"

echo "=== Push sdkUpdating ==="
git push origin sdkUpdating

echo "=== Merge → main ==="
git checkout main
git pull origin main
git merge sdkUpdating --no-ff -m "merge: sdkUpdating → main (SDK 54, v0.1.5)"
git push origin main

echo "=== Voltar para sdkUpdating ==="
git checkout sdkUpdating

echo ""
echo "✅ Concluído! sdkUpdating mergeado em main."
read -p "Pressione Enter para fechar..."
