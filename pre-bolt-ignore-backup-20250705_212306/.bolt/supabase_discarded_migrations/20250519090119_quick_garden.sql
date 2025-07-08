/*
  # Drop todo and deployment tables
  
  This migration removes the todo and deployment tables from the database.
*/

-- Drop the todo table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'todo'
  ) THEN
    DROP TABLE public.todo;
  END IF;
END $$;

-- Drop the deployments table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'deployments'
  ) THEN
    DROP TABLE public.deployments;
  END IF;
END $$;