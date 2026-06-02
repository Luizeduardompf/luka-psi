#!/bin/bash
cd /Users/claudecode/Documents/Claude/Projects/Luka/Luka

echo "🔓 Removendo todos os git locks..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock .git/packed-refs.lock
echo "✅ Locks removidos"

echo ""
echo "📝 Atualizando .gitignore com .expo-go-cache..."
grep -q "expo-go-cache" .gitignore || echo -e "\n# Expo Go cache (large APK file)\n.expo-go-cache/" >> .gitignore

echo ""
echo "🗑️  Removendo .expo-go-cache do git tracking..."
git rm --cached -r .expo-go-cache/ 2>/dev/null && echo "Removido do tracking" || echo "Já não estava no tracking"

echo ""
echo "📦 Adicionando .gitignore ao staging..."
git add .gitignore

echo ""
echo "✏️  Amendendo o commit para remover o arquivo grande..."
git commit --amend --no-edit

echo ""
echo "🚀 Fazendo push (force-with-lease por causa do amend)..."
git push --force-with-lease --set-upstream origin feature/custom-forms

echo ""
echo "✅ Tudo pronto!"
echo ""
git log --oneline -3
echo ""
read -p "Pressione Enter para fechar..."
