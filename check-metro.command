#!/usr/bin/env bash
echo "=== Verificando Metro/Node ==="
pgrep -a node | grep -E "metro|expo|react-native" || echo "Nenhum processo node/metro encontrado"
echo ""
echo "=== Porta 8081 ==="
lsof -i :8081 | head -5 || echo "Porta 8081 não está em uso"
echo ""
echo "=== Teste HTTP ==="
curl -s --max-time 3 http://localhost:8081/status && echo "" || echo "Metro não respondeu em localhost:8081"
