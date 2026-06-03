#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Removendo git lock se existir ==="
rm -f .git/index.lock

echo "=== Verificando branch ==="
git branch --show-current

echo "=== Commit do upgrade SDK 52 → 54 ==="
git add -A
git commit -m "feat: upgrade SDK 52 → 54 (expo-router 6, RN 0.81.5, React 19.1)

- expo ~52 → ~54, expo-router ~4 → ~6, react-native 0.76 → 0.81
- react 18 → 19.1, @expo/vector-icons 14 → 15
- expo-file-system legacy import para cacheDirectory/EncodingType
- tipos: patient_terminology em database.types, CountryForm, PracticeLocationForm
- FormQuestionOption.created_at opcional
- testes: supabasePublic mock, ilike/maybeSingle no chainable, queue ajustada
- 82/82 testes passando, 0 erros TypeScript"

echo "=== Push sdkUpdating ==="
git push origin sdkUpdating

echo ""
echo "✅ Commit e push concluídos na branch sdkUpdating!"
read -p "Pressione Enter para fechar..."
