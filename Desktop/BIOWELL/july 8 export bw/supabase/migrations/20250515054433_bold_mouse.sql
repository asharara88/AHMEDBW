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

-- Add RLS policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'deployments' AND policyname = 'Allow authenticated users to read deployments'
  ) THEN
    CREATE POLICY "Allow authenticated users to read deployments"
      ON deployments FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create trigger function if it doesn't exist
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