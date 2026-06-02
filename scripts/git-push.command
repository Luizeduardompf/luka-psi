#!/bin/bash
cd /Users/claudecode/Documents/Claude/Projects/Luka/Luka
echo "🚀 Pushing feature/custom-forms..."
git push --set-upstream origin feature/custom-forms
echo ""
echo "✅ Push concluído!"
echo ""
git log --oneline -3
echo ""
read -p "Pressione Enter para fechar..."
