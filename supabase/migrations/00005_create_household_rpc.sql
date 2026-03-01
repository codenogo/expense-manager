-- Create a SECURITY DEFINER function to handle household creation + profile
-- update atomically, bypassing RLS for the onboarding flow.
--
-- Problem: INSERT ... RETURNING on households requires both INSERT and SELECT
-- RLS policies to pass. The SELECT policy checks get_my_household_id(), but
-- during onboarding the profile hasn't been linked yet, so SELECT fails.

CREATE OR REPLACE FUNCTION public.create_household(household_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  calling_user uuid := auth.uid();
BEGIN
  IF calling_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF household_name IS NULL OR trim(household_name) = '' THEN
    RAISE EXCEPTION 'Household name is required';
  END IF;

  -- Create the household
  INSERT INTO households (name)
  VALUES (trim(household_name))
  RETURNING id INTO new_id;

  -- Link the user's profile to the new household as admin
  UPDATE profiles
  SET household_id = new_id, role = 'admin'
  WHERE id = calling_user;

  RETURN new_id;
END;
$$;
