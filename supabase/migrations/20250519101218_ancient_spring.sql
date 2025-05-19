/*
  # Fix Profiles RLS Policies

  1. Changes
    - Ensure RLS is enabled on profiles table
    - Add proper RLS policies for profiles table
    - Fix the id/user_id confusion in policies

  2. Security
    - Allow users to read and update their own profiles
    - Allow service role to have full access
*/

-- Enable RLS if not already
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can read own data"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access to profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);