-- Fix: households FOR ALL policy WITH CHECK blocks INSERT for new users
-- even though a separate FOR INSERT policy exists.
--
-- Replace the single FOR ALL policy with specific per-operation policies
-- so the INSERT policy is the only one evaluated for inserts.

-- Drop existing policies
DROP POLICY IF EXISTS "households_member_access" ON households;
DROP POLICY IF EXISTS "households_insert" ON households;

-- SELECT: only your household
CREATE POLICY "households_select" ON households
  FOR SELECT
  USING (id = public.get_my_household_id());

-- UPDATE: only your household
CREATE POLICY "households_update" ON households
  FOR UPDATE
  USING (id = public.get_my_household_id())
  WITH CHECK (id = public.get_my_household_id());

-- DELETE: only your household
CREATE POLICY "households_delete" ON households
  FOR DELETE
  USING (id = public.get_my_household_id());

-- INSERT: any authenticated user can create a household
CREATE POLICY "households_insert" ON households
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
