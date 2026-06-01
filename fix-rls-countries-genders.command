#!/bin/bash
echo "Aplicando RLS policies em countries e genders..."

PGPASSWORD="Luka@2024Psico!" psql \
  "host=db.evrwztudtfjbyhbqilxt.supabase.co port=5432 dbname=postgres user=postgres sslmode=require" \
  <<'SQL'
-- countries: INSERT / UPDATE / DELETE para authenticated
DROP POLICY IF EXISTS "authenticated_insert_countries" ON countries;
CREATE POLICY "authenticated_insert_countries" ON countries
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_countries" ON countries;
CREATE POLICY "authenticated_update_countries" ON countries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_countries" ON countries;
CREATE POLICY "authenticated_delete_countries" ON countries
  FOR DELETE TO authenticated USING (true);

-- genders: INSERT / UPDATE / DELETE para authenticated
DROP POLICY IF EXISTS "genders_insert_auth" ON genders;
CREATE POLICY "genders_insert_auth" ON genders
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "genders_update_auth" ON genders;
CREATE POLICY "genders_update_auth" ON genders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "genders_delete_auth" ON genders;
CREATE POLICY "genders_delete_auth" ON genders
  FOR DELETE TO authenticated USING (true);

SELECT tablename, policyname, cmd FROM pg_policies
  WHERE tablename IN ('countries','genders')
  ORDER BY tablename, cmd;
SQL

echo ""
echo "Concluído! Verifique as policies acima."
sleep 3
