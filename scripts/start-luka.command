#!/bin/bash
cd "$(dirname "$0")"
echo "=== Luka — iniciando Metro ==="
# Matar processos anteriores
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null
sleep 1
# Limpar cache e iniciar
npx expo start --reset-cache
