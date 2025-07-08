/*
  # Deployment Table and Policies

  1. Table Creation
    - Creates deployments table with necessary fields
    - Enables Row Level Security
  2. Security Policies
    - Adds read access policy for public users
    - Adds TTL policy to limit data visibility
  3. Triggers
    - Adds updated_at trigger for timestamp management
  4. Sample Data
    - Inserts initial sample deployment if table is empty
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

-- Enable Row Level Security
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
  
  -- Check if TTL policy exists before creating
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

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS update_deployments_updated_at ON public.deployments;

-- Create trigger
CREATE TRIGGER update_deployments_updated_at
BEFORE UPDATE ON public.deployments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample deployment data only if table is empty
INSERT INTO public.deployments (status, url, created_at)
SELECT 'deployed', 'https://biowell-demo.netlify.app', now()
WHERE NOT EXISTS (SELECT 1 FROM public.deployments);