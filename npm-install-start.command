#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps
echo ""
echo "🔄 Iniciando Expo com cache limpo..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2
npx expo start --clear
