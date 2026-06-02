#!/bin/bash
cd "$(dirname "$0")"
# Mata qualquer processo Expo/Metro rodando
lsof -ti:8081,8082 | xargs kill -9 2>/dev/null
pkill -f "expo start" 2>/dev/null
sleep 1
git checkout luka-app-redesign
npx expo start --ios
