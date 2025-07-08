/*
  # Fix user_supplements RLS Policies

  1. Changes
    - Drop existing RLS policies on user_supplements table
    - Add new policies that properly handle authenticated users
    - Enable RLS on the table
    - Add policies for insert, select, update, and delete operations

  2. Security
    - Users can only access their own supplement subscriptions
    - Maintain data isolation between users
    - Allow authenticated users to manage their subscriptions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own supplement subscriptions" ON user_supplements;
DROP POLICY IF EXISTS "Users can insert their own supplement subscriptions" ON user_supplements;
DROP POLICY IF EXISTS "Users can update their own supplement subscriptions" ON user_supplements;
DROP POLICY IF EXISTS "Users can delete their own supplement subscriptions" ON user_supplements;

-- Enable RLS
ALTER TABLE user_supplements ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for users" ON user_supplements
  FOR SELECT USING (
    auth.uid() = user_id
  );

CREATE POLICY "Enable insert access for users" ON user_supplements
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Enable update access for users" ON user_supplements
  FOR UPDATE USING (
    auth.uid() = user_id
  );

CREATE POLICY "Enable delete access for users" ON user_supplements
  FOR DELETE USING (
    auth.uid() = user_id
  );