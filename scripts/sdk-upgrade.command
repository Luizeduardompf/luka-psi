#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== SDK 52 → 54: iniciando upgrade ==="
echo ""

echo "1. Removendo node_modules..."
rm -rf node_modules package-lock.json
echo "   ✓ node_modules removido"

echo ""
echo "2. Instalando dependências (SDK 54)..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
  echo "❌ npm install falhou"
  read -p "Pressione Enter para fechar..."
  exit 1
fi
echo "   ✓ npm install concluído"

echo ""
echo "3. Ajustando versões exatas das dependências Expo..."
npx expo install --fix
echo "   ✓ expo install --fix concluído"

echo ""
echo "4. Verificando problemas..."
npx expo-doctor 2>/dev/null || true

echo ""
echo "✅ Upgrade concluído! Verifique os erros acima se houver."
echo ""
read -p "Pressione Enter para fechar..."
