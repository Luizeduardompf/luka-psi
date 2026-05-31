#!/bin/bash
set -e
cd /Users/claudecode/Documents/Claude/Projects/Luka/Luka

echo "🔓 Removendo locks..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock 2>/dev/null || true

echo ""
echo "📍 Branch atual:"
git branch --show-current

echo ""
echo "🌿 Criando/trocando para branch limpa baseada em origin/main..."
git checkout -B feature/forms-vercel 47a6852

echo ""
echo "📂 Copiando todos os arquivos da feature/custom-forms (sem .expo-go-cache)..."
# Lista todos os arquivos que diferem entre origin/main e feature/custom-forms
# excluindo .expo-go-cache, e faz checkout deles para o working tree
git diff --name-only 47a6852 3aeb420 | grep -v '^\.expo-go-cache' | while IFS= read -r file; do
  # Cria o diretório se não existir
  dir=$(dirname "$file")
  mkdir -p "$dir" 2>/dev/null || true
  # Faz checkout do arquivo da branch custom-forms
  git show "3aeb420:$file" > "$file" 2>/dev/null && echo "  ✓ $file" || echo "  ✗ SKIP: $file (não existe na branch)"
done

echo ""
echo "📦 Staging de todos os arquivos..."
git add -A
# Garantir que .expo-go-cache não está staged
git reset HEAD ".expo-go-cache" 2>/dev/null || true

echo ""
echo "📋 Arquivos que serão commitados:"
git diff --cached --name-only | head -20

echo ""
echo "💾 Commitando..."
git commit -m "feat(forms+vercel): módulo completo de formulários + deploy web

Módulo de formulários clínicos:
- Templates editáveis (seções, perguntas, opções)
- Página pública de preenchimento pelo paciente (sem auth)
- Envio com senha, prazo e mensagem personalizada
- Snapshot imutável no momento do envio
- Status: pending → opened → completed
- Visualização de respostas na ficha do paciente

Correções para deploy web (Vercel):
- supabase.ts: localStorage fallback para web platform
- PatientFormsTab: clipboard cross-platform
- app.json: plataforma web + metro bundler + output single
- vercel.json: SPA rewrites + security headers
- .env.vercel: guia das env vars no Vercel
- .gitignore: ignorar .expo-go-cache"

echo ""
echo "🚀 Fazendo push..."
git push --set-upstream origin feature/forms-vercel

echo ""
echo "✅ Concluído! Branch feature/forms-vercel no GitHub."
echo ""
git log --oneline -3
echo ""
read -p "Pressione Enter para fechar..."
