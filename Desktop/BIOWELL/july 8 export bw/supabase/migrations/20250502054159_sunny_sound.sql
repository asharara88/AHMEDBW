-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read their own chat messages" ON chat_history;
DROP POLICY IF EXISTS "Allow users to insert their own chat messages" ON chat_history;
DROP POLICY IF EXISTS "service_role_access" ON chat_history;

-- Disable RLS
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;