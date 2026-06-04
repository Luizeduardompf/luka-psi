#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Downgrade reanimated 4 → 3 ==="
rm -rf node_modules/react-native-reanimated node_modules/react-native-worklets 2>/dev/null
npm install react-native-reanimated@~3.17.0 --legacy-peer-deps 2>&1 | tail -5
echo "✓ reanimated instalado"

node -e "console.log('reanimated:', require('./node_modules/react-native-reanimated/package.json').version)"

echo ""
echo "=== Iniciando Expo no simulador iOS ==="
npx expo start --ios
