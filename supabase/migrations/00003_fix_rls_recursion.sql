-- Fix infinite recursion in profiles RLS policies and allow household creation
--
-- Problem 1: profiles_household_read policy queries profiles from within
--   a policy on profiles → infinite recursion.
-- Problem 2: households_household_access requires user to already have a
--   household_id, so new users can never INSERT a household during onboarding.
--
-- Solution: A SECURITY DEFINER function that bypasses RLS to look up the
-- current user's household_id, plus a permissive INSERT policy on households.

-- ============================================================
-- HELPER FUNCTION (bypasses RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_household_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- FIX: profiles policies
-- ============================================================

-- Drop the recursive policy
DROP POLICY IF EXISTS "profiles_household_read" ON profiles;

-- Replace with one that uses the SECURITY DEFINER function
CREATE POLICY "profiles_household_read" ON profiles
  FOR SELECT
  USING (
    household_id = public.get_my_household_id()
  );

-- ============================================================
-- FIX: households policies
-- ============================================================

-- Drop the old policy that blocks inserts for new users
DROP POLICY IF EXISTS "households_household_access" ON households;

-- SELECT/UPDATE/DELETE: only if you belong to the household
CREATE POLICY "households_member_access" ON households
  FOR ALL
  USING (
    id = public.get_my_household_id()
  )
  WITH CHECK (
    id = public.get_my_household_id()
  );

-- INSERT: any authenticated user can create a household
CREATE POLICY "households_insert" ON households
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- FIX: all other tables that query profiles in their policies
-- Replace subqueries with get_my_household_id()
-- ============================================================

-- accounts
DROP POLICY IF EXISTS "accounts_household_access" ON accounts;
CREATE POLICY "accounts_household_access" ON accounts
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());

-- categories
DROP POLICY IF EXISTS "categories_household_access" ON categories;
CREATE POLICY "categories_household_access" ON categories
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());

-- transactions
DROP POLICY IF EXISTS "transactions_household_access" ON transactions;
CREATE POLICY "transactions_household_access" ON transactions
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());

-- budgets
DROP POLICY IF EXISTS "budgets_household_access" ON budgets;
CREATE POLICY "budgets_household_access" ON budgets
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());

-- recurring_items
DROP POLICY IF EXISTS "recurring_items_household_access" ON recurring_items;
CREATE POLICY "recurring_items_household_access" ON recurring_items
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());

-- debts
DROP POLICY IF EXISTS "debts_household_access" ON debts;
CREATE POLICY "debts_household_access" ON debts
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());

-- savings_goals
DROP POLICY IF EXISTS "savings_goals_household_access" ON savings_goals;
CREATE POLICY "savings_goals_household_access" ON savings_goals
  FOR ALL
  USING (household_id = public.get_my_household_id())
  WITH CHECK (household_id = public.get_my_household_id());
