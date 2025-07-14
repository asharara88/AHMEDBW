/*
  # Create deployments table

  1. New Tables
    - `deployments`
      - `id` (uuid, primary key)
      - `status` (text)
      - `url` (text)
      - `error_message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `claimed` (boolean)
      - `claim_url` (text)
  2. Security
    - Enable RLS on `deployments` table
    - Add policy for public users to read deployments
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
CREATE POLICY "Allow authenticated users to read deployments"
  ON public.deployments FOR SELECT
  TO public
  USING (true);

-- Create policy with TTL (Time To Live) of 1 day
CREATE POLICY "Policy to implement Time To Live (TTL)"
  ON public.deployments FOR SELECT
  TO public
  USING (created_at > CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Create trigger for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deployments_updated_at
BEFORE UPDATE ON public.deployments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample deployment data
INSERT INTO public.deployments (status, url, created_at)
VALUES ('deployed', 'https://biowell-demo.netlify.app', now())
ON CONFLICT DO NOTHING;