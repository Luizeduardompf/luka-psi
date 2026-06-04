#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Commit final do SDK upgrade ==="
rm -f .git/index.lock

git add -A
git commit -m "feat: SDK 52 → 54 completo

- expo ~54, expo-router ~5, react-native 0.81.5, react 19.1
- newArchEnabled: false (compatibilidade Expo Go)
- runtimeVersion: sdkVersion
- expo-file-system legacy imports
- tipos: patient_terminology, CountryForm, PracticeLocationForm
- testes: supabasePublic mock, ilike/maybeSingle no chainable
- ARCHITECTURE.md atualizado (Router v5, RN 0.81.5, React 19.1)
- 82/82 testes passando, 0 erros TypeScript"

echo "=== Push sdkUpdating ==="
git push origin sdkUpdating

echo ""
echo "✅ Concluído!"
read -p "Pressione Enter para fechar..."
