#!/bin/bash
cd "$(dirname "$0")/.."
rm -f .git/index.lock .git/packed-refs.lock
git add supabase/migrations/20260604_profile_field_questions.sql
git commit -m "fix: adicionar profile_field ao enum question_type na migration"
git push origin feature/profile-field-questions
echo ""
echo "Done."
read -p "Pressione Enter para fechar..."
