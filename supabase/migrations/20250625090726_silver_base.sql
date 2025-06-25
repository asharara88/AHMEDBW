/*
  # Fix Profile Creation Function

  1. Changes
    - Update the create_profile_for_new_user function to properly handle all required fields
    - Add proper error handling to prevent transaction failures
    - Ensure compatibility with the current profiles table schema

  2. Security
    - Maintain SECURITY DEFINER to ensure the function has proper permissions
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
      first_name,
      last_name,
      avatar_url,
      is_admin,
      onboarding_completed,
      mobile,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      NULL,
      NULL,
      NULL,
      FALSE,
      FALSE,
      NULL,
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;

-- Create trigger
CREATE TRIGGER create_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_new_user();