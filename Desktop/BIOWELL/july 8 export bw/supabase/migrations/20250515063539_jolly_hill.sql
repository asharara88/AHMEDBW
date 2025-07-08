/*
  # Create Profile Trigger Function

  1. New Functions
    - `create_profile_for_new_user`: Creates a profile record when a new user signs up
    - Handles user metadata properly and includes error handling

  2. Changes
    - Replaces the existing trigger function with an improved version
    - Adds error handling to prevent transaction failures
    - Adds policy for service role to create profiles
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