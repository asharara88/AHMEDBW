/*
  # Fix Chat History Foreign Key Constraints

  1. Changes
    - Drop existing foreign key constraint on chat_history
    - Add new foreign key constraint that references users table directly
    - Update RLS policies to handle demo user

  2. Security
    - Maintain data isolation between users
    - Allow demo user to use chat functionality
*/

-- Drop existing foreign key constraint
ALTER TABLE chat_history
DROP CONSTRAINT IF EXISTS chat_history_user_id_fkey;

-- Add new foreign key constraint referencing auth.users
ALTER TABLE chat_history
ADD CONSTRAINT chat_history_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for chat history
CREATE POLICY "Users can insert their own chat messages"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can view their own chat messages"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');