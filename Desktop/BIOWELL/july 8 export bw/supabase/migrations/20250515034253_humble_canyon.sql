/*
  # Create Deployments Table

  1. New Tables
    - `deployments`: Stores deployment information
      - `id` (uuid, primary key)
      - `status` (text)
      - `url` (text)
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on deployments table
    - Add policy for authenticated users to read deployments
*/

-- Create deployments table if it doesn't exist
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow authenticated users to read deployments"
  ON deployments FOR SELECT
  USING (true);

-- Create trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to deployments table
DROP TRIGGER IF EXISTS update_deployments_updated_at ON deployments;
CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample deployment data
INSERT INTO deployments (status, url, created_at)
VALUES 
  ('deployed', 'https://biowell-app.netlify.app', NOW())
ON CONFLICT (id) DO NOTHING;