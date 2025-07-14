/*
  # User Profile Trigger Function

  1. New Functions
    - `create_profile_for_new_user`: Creates a profile record when a new user signs up
    - Trigger to automatically run the function after user creation

  2. Changes
    - Add trigger to auth.users table
    - Ensure profile creation with matching UUID
*/

-- Create the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;
CREATE TRIGGER create_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_new_user();