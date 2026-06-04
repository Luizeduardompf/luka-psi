#!/bin/bash
cd "$(dirname "$0")/.."
rm -f .git/index.lock .git/packed-refs.lock
git add -A
git commit -m "feat: profile_field questions — link form questions to patient profile

- Migration: profile_field_key em form_questions, tabela patient_field_sources com RLS
- Catálogo de 35 campos mapeáveis do paciente (patientProfileFields.ts)
- Novo tipo de pergunta 'profile_field' no QuestionType
- Editor: modal com dois modos (Livre / Dados do Perfil) + badge no builder
- Snapshot inclui profile_field_key e profile_field_options (lookups)
- QuestionRenderer renderiza profile_field com input correto por inputType
- completeSubmission atualiza patients + upsert em patient_field_sources
- PatientForm exibe indicativo 'Preenchido pelo paciente' por campo
- hooks usePatientFieldSources e useClearPatientFieldSources
- v0.1.9"
git push origin feature/profile-field-questions
echo ""
echo "✓ Commit e push concluídos."
read -p "Pressione Enter para fechar..."
