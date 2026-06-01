#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add -A
git commit -m "feat: settings screens, home redesign, forms improvements

- Profile screen: renamed 'nome comercial' -> 'nome profissional', image upload for logo/signature, gender dropdown
- Home screen: avatar + greeting left, notification bell + settings gear right
- Tab layout: Configuracoes removed from tab bar
- Forms screen: removed 'Entrar' button, all cards clickable to enter
- PatientForm: replaced gender chips with SelectDropdown, added DDI field for phone
- Settings: added Generos/Sexo, Paises, Locais de pratica, Terminologia sections
- New screens: terminology, genders, countries, practice-locations (all full CRUD)
- forms/send.tsx: field type dropdown, date validation with auto-mask and future date check
- Migration 009: RLS fixes, new tables, profile columns"
git push origin main
echo "Done!"
