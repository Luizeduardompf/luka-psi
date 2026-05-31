#!/bin/bash
cd /Users/claudecode/Documents/Claude/Projects/Luka/Luka

echo "🔓 Removendo locks..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock .git/packed-refs.lock

echo ""
echo "🧹 Reescrevendo histórico para remover .expo-go-cache (arquivo grande)..."
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch .expo-go-cache/' \
  --prune-empty --tag-name-filter cat -- HEAD

echo ""
echo "📝 Atualizando .gitignore..."
grep -q "expo-go-cache" .gitignore || echo -e "\n# Expo Go cache\n.expo-go-cache/" >> .gitignore
git add .gitignore
git commit --amend --no-edit 2>/dev/null || true

echo ""
echo "🗑️  Removendo backup refs do filter-branch..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -I {} git update-ref -d {}
echo "🗑️  Expirando reflogs e limpando objetos..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive
echo "Tamanho do pack após gc:"
du -sh .git/objects/pack/ 2>/dev/null || true

echo ""
echo "🚀 Fazendo push (force — histórico foi reescrito)..."
git push --force --set-upstream origin feature/custom-forms

echo ""
echo "✅ Concluído!"
git log --oneline -5
echo ""
read -p "Pressione Enter para fechar..."
