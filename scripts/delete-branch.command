#!/bin/bash
cd "$(dirname "$0")/.."
rm -f .git/packed-refs.lock .git/refs/heads/feature/custom-forms.lock
git push origin --delete feature/custom-forms
echo "Done. Branch feature/custom-forms deletada do remote."
read -p "Pressione Enter para fechar..."
