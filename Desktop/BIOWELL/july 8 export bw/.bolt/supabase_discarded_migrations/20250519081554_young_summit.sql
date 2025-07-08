/*
  # Fix Deployments Table and Policies

  1. New Tables
    - Ensures `deployments` table exists with proper structure
  2. Security
    - Enables RLS on the deployments table
    - Creates policies for reading deployments
  3. Changes
    - Uses DO blocks with exception handling to safely create policies
    - Adds sample deployment data
*/

-- Create deployments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  url text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  claimed boolean DEFAULT false,
  claim_url text
);

-- Enable Row Level Security if not already enabled
DO $$ 
BEGIN
  -- Check if RLS is already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'deployments' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies with safety checks
DO $$ 
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'deployments' 
    AND policyname = 'Allow authenticated users to read deployments'
  ) THEN
    CREATE POLICY "Allow authenticated users to read deployments"
      ON public.deployments FOR SELECT
      TO public
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'deployments' 
    AND policyname = 'Policy to implement Time To Live (TTL)'
  ) THEN
    CREATE POLICY "Policy to implement Time To Live (TTL)"
      ON public.deployments FOR SELECT
      TO public
      USING (created_at > CURRENT_TIMESTAMP - INTERVAL '1 day');
  END IF;
END $$;

-- Create trigger for updating updated_at column if it doesn't exist
DO $$ 
BEGIN
  -- First check if the function exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_updated_at_column'
  ) THEN
    -- Create the function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
  
  -- Then check if the trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_deployments_updated_at'
  ) THEN
    CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON public.deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample deployment data if the table is empty
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.deployments LIMIT 1) THEN
    INSERT INTO public.deployments (status, url, created_at)
    VALUES ('deployed', 'https://biowell-demo.netlify.app', now());
  END IF;
END $$;