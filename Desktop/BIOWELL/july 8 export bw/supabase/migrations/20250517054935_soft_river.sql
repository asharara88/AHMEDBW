/*
  # Add mobile column to profiles table

  1. Changes
     - Add mobile column to profiles table
     - This fixes the error "column profiles.mobile does not exist"
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'mobile'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN mobile text;
  END IF;
END $$;