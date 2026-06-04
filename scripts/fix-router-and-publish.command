#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Corrigindo expo-router 6 → 5 (SDK 54) ==="

echo "1. Removendo expo-router v6..."
rm -rf node_modules/expo-router node_modules/@expo/router 2>/dev/null
echo "   ✓ Removido"

echo "2. Instalando expo-router v5..."
npm install expo-router@~5.0.0 --legacy-peer-deps 2>&1 | tail -5
echo "   ✓ Instalado"

echo "3. Verificando versão..."
node -e "console.log('expo-router:', require('./node_modules/expo-router/package.json').version)"

echo ""
echo "4. Publicando EAS Update..."
npx eas-cli update --branch main --message "fix: expo-router 5 (SDK 54), newArch disabled"

echo ""
echo "✅ Concluído!"
read -p "Pressione Enter para fechar..."
