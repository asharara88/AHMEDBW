/*
  # Add mobile column to profiles table

  1. Changes
    - Add `mobile` column to `profiles` table
    - Make it nullable to maintain compatibility with existing records
    - Add index for performance

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'mobile'
  ) THEN
    ALTER TABLE profiles ADD COLUMN mobile text;
    CREATE INDEX idx_profiles_mobile ON profiles(mobile);
  END IF;
END $$;