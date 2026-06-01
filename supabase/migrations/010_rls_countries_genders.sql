-- Migration 010: Fix RLS — add INSERT/UPDATE/DELETE policies for countries and genders
-- Context: migrations 009 only created SELECT policies for these lookup tables,
-- blocking authenticated users from creating/editing/deleting entries.

-- countries: CRUD for authenticated users
DROP POLICY IF EXISTS "authenticated_insert_countries" ON countries;
CREATE POLICY "authenticated_insert_countries" ON countries
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_countries" ON countries;
CREATE POLICY "authenticated_update_countries" ON countries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_countries" ON countries;
CREATE POLICY "authenticated_delete_countries" ON countries
  FOR DELETE TO authenticated USING (true);

-- genders: CRUD for authenticated users
DROP POLICY IF EXISTS "genders_insert_auth" ON genders;
CREATE POLICY "genders_insert_auth" ON genders
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "genders_update_auth" ON genders;
CREATE POLICY "genders_update_auth" ON genders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "genders_delete_auth" ON genders;
CREATE POLICY "genders_delete_auth" ON genders
  FOR DELETE TO authenticated USING (true);
