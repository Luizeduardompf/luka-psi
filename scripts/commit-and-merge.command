#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Removendo git lock se existir ==="
rm -f .git/index.lock

echo "=== Commit na branch luka-app-redesign ==="
git add -A
git commit -m "feat: patient photo, local de prática reordenado, prazo oculto pós-conclusão, CLAUDE.md atualizado"

echo "=== Push da branch luka-app-redesign ==="
git push origin luka-app-redesign

echo "=== Checkout main ==="
git checkout main
git pull origin main

echo "=== Merge luka-app-redesign → main ==="
git merge luka-app-redesign --no-ff -m "merge: luka-app-redesign → main"

echo "=== Push main ==="
git push origin main

echo "=== Criar branch sdkUpdating ==="
git checkout -b sdkUpdating

echo "=== Push sdkUpdating ==="
git push origin sdkUpdating

echo ""
echo "✅ Pronto! Branch sdkUpdating criada a partir da main."
read -p "Pressione Enter para fechar..."
