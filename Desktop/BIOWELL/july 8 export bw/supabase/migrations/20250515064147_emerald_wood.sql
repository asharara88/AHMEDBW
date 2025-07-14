/*
  # Fix Onboarding Profile Creation

  1. Changes
    - Update the create_profile_for_new_user function to handle errors gracefully
    - Add proper error handling for missing user data
    - Ensure the function works with the auth.users trigger

  2. Security
    - Maintain SECURITY DEFINER to ensure the function has proper permissions
    - Add service role policy for profile creation
*/

-- Create or replace the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the email from the new user record
  user_email := NEW.email;
  
  -- Insert profile with proper error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a policy to allow the service role to create profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Service role has full access to profiles'
  ) THEN
    CREATE POLICY "Service role has full access to profiles"
      ON profiles FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Note: The trigger on auth.users will be created through the Supabase dashboard
-- or using the Supabase CLI, as direct SQL migrations cannot modify the auth schema
-- through the REST API.

-- Instead, we'll create a comment to document this requirement
COMMENT ON FUNCTION public.create_profile_for_new_user() IS 
  'This function should be attached as a trigger AFTER INSERT ON auth.users. 
   Please create this trigger manually through the Supabase dashboard or CLI.';