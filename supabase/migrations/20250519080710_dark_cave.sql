/*
  # Fix todos table and policies

  1. Changes
    - Safely drop existing policies if they exist
    - Create todos table if it doesn't exist
    - Add proper columns with constraints
    - Enable RLS and create policies with proper error handling
    - Create index for better performance
  
  2. Security
    - Enable RLS on todos table
    - Add policies for CRUD operations
*/

-- Drop existing policies if they exist (using DO block for safety)
DO $$ 
BEGIN
  -- Attempt to drop policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Allow users to view their own todos" ON public.todos;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Allow users to insert todos" ON public.todos;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Allow users to update their own todos" ON public.todos;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Allow users to delete their own todos" ON public.todos;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
END $$;

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

-- Create RLS policies with IF NOT EXISTS to avoid errors
DO $$ 
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'todos' 
    AND policyname = 'Allow users to view their own todos'
  ) THEN
    CREATE POLICY "Allow users to view their own todos"
      ON public.todos FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'todos' 
    AND policyname = 'Allow users to insert todos'
  ) THEN
    CREATE POLICY "Allow users to insert todos"
      ON public.todos FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'todos' 
    AND policyname = 'Allow users to update their own todos'
  ) THEN
    CREATE POLICY "Allow users to update their own todos"
      ON public.todos FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'todos' 
    AND policyname = 'Allow users to delete their own todos'
  ) THEN
    CREATE POLICY "Allow users to delete their own todos"
      ON public.todos FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for faster queries if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'todos' 
    AND indexname = 'idx_todos_user_id'
  ) THEN
    CREATE INDEX idx_todos_user_id ON public.todos(user_id);
  END IF;
END $$;