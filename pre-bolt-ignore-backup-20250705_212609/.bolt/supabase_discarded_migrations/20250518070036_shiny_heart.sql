/*
  # Create Todos Table

  1. New Tables
    - `todos`: Stores user todo items
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on todos table
    - Add policies for users to manage their own todos
*/

-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- Insert some sample data
DO $$
BEGIN
  -- Check if the table exists and has the title column before inserting
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'todos' AND column_name = 'title'
  ) THEN
    -- Only insert if there are no existing records
    IF (SELECT COUNT(*) FROM public.todos) = 0 THEN
      INSERT INTO public.todos (user_id, title)
      VALUES 
        ('00000000-0000-0000-0000-000000000000', 'Complete onboarding'),
        ('00000000-0000-0000-0000-000000000000', 'Connect wearable device'),
        ('00000000-0000-0000-0000-000000000000', 'Set health goals');
    END IF;
  END IF;
END $$;