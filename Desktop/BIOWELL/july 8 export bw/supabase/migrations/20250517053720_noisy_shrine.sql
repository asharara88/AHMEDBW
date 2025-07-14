/*
  # Add mobile column to profiles table

  1. Changes
     - Adds a new `mobile` column to the `profiles` table
     - Creates an index on the mobile column for better query performance

  2. Purpose
     - Fixes the application error where the frontend is trying to access a non-existent column
     - Enables storing user mobile numbers for contact purposes
*/

-- Add mobile column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'mobile'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN mobile text;
    
    -- Create an index on the mobile column for better query performance
    CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
    
    -- Comment explaining the purpose of the column
    COMMENT ON COLUMN public.profiles.mobile IS 'User mobile phone number for contact purposes';
  END IF;
END $$;