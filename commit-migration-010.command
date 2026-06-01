#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add supabase/migrations/010_rls_countries_genders.sql fix-rls-countries-genders.command
git commit -m "fix: migration 010 — RLS policies INSERT/UPDATE/DELETE for countries and genders

Countries and genders tables were missing write policies.
Applied via SQL editor 2026-06-01. Migration documents the fix."
git push origin main
echo "Done!"
sleep 2
