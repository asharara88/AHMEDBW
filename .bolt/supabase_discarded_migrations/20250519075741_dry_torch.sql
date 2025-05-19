/*
  # Fix todos table migration

  1. Changes
     - Make policy creation idempotent with DROP IF EXISTS before CREATE
     - Use IF NOT EXISTS for all object creations
     - Ensure clean migration regardless of existing objects
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Allow users to insert todos" ON public.todos;
DROP POLICY IF EXISTS "Allow users to update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Allow users to delete their own todos" ON public.todos;

-- Create todos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to view their own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries if it doesn't exist
DROP INDEX IF EXISTS idx_todos_user_id;
CREATE INDEX idx_todos_user_id ON public.todos(user_id);