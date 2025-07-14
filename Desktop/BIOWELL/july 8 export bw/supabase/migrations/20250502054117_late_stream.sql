/*
  # Disable RLS on chat_history table

  1. Changes
    - Disable RLS on chat_history table temporarily
    - Drop existing policies that are causing issues

  Note: This is a temporary solution. RLS should be re-enabled with proper policies
  once the authentication flow is fully tested and working.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read their own chat messages" ON chat_history;
DROP POLICY IF EXISTS "Allow users to insert their own chat messages" ON chat_history;
DROP POLICY IF EXISTS "service_role_access" ON chat_history;

-- Disable RLS
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;