#!/bin/bash
cd "$(dirname "$0")"
git add -A
git commit -m "fix: resolve 9 bugs — toast CRUD, birth_date, NIF/CPF validation, pronoun greeting, gender_id patients, unique form name, password not stored in message, public form submit/validation

- Toast notifications on all CRUD saves (patients, forms, profile, genders, countries, practice-locations)
- Profile: removed preferred_name, added birth_date (DD/MM/YYYY mask + validation), NIF/CPF validation wired via isValidNif/isValidCpf
- Home greeting: pronoun + commercial_name from genders table
- Genders CRUD: removed terminology field, only name + pronoun_treatment
- PatientForm: gender_id from genders table (DB-driven dropdown)
- forms.service.ts: unique form name validation in createTemplate
- forms/send.tsx: <<senha>> not stored in compiled custom_message (DB snapshot)
- Public form (f/[token].tsx): required field validation, date validation, inline errors (no Alert.alert on web), fixed submit flow
- DB migration 011: birth_date DATE column on profiles (applied to Supabase)"
git push origin main
echo "Done!"
