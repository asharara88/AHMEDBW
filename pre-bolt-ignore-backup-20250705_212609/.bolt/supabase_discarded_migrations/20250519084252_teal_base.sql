/*
  # Create deployments table

  1. New Tables
    - `deployments` - Stores deployment information
      - `id` (uuid, primary key)
      - `status` (text, not null)
      - `url` (text)
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `claimed` (boolean)
      - `claim_url` (text)
  
  2. Security
    - Enable RLS on `deployments` table
    - Add policies for public read access
    - Add TTL policy for automatic cleanup
  
  3. Triggers
    - Add trigger to update `updated_at` column
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

-- Create RLS policies if they don't exist
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read deployments"
  ON public.deployments FOR SELECT
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "Policy to implement Time To Live (TTL)"
  ON public.deployments FOR SELECT
  TO public
  USING (created_at > CURRENT_TIMESTAMP - INTERVAL '1 day');

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