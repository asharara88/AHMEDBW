/*
  # Supplement Forms Schema

  1. New Tables
    - `supplement_forms` table to store information about different supplement forms
      - `form_type` (text, primary key)
      - `name` (text, required)
      - `image_url` (text, required)
      - `used_for` (text, required) 
      - `created_at` and `updated_at` timestamps
  2. Security
    - Enable RLS on `supplement_forms` table
    - Add policies for public read access
    - Add policies for authenticated user management
*/

-- Create supplement_forms table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplement_forms_new (
  form_type TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  used_for TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- If the original table exists, copy data and then drop/rename tables
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplement_forms') THEN
    -- Copy data from old table to new table
    INSERT INTO supplement_forms_new (form_type, name, image_url, used_for, created_at, updated_at)
    SELECT form_type, name, image_url, used_for, created_at, updated_at 
    FROM supplement_forms
    ON CONFLICT (form_type) DO NOTHING;
    
    -- Drop the old table
    DROP TABLE supplement_forms;
  END IF;
  
  -- Rename the new table to the original name
  ALTER TABLE IF EXISTS supplement_forms_new RENAME TO supplement_forms;
END $$;

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_supplement_forms_name ON supplement_forms(name);

-- Enable Row Level Security
ALTER TABLE supplement_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for supplement_forms
-- Allow anyone to view supplement forms
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplement_forms' AND policyname = 'Anyone can view supplement forms') THEN
    CREATE POLICY "Anyone can view supplement forms"
      ON supplement_forms
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Allow authenticated users to manage supplement forms
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplement_forms' AND policyname = 'Users can view supplement forms') THEN
    CREATE POLICY "Users can view supplement forms"
      ON supplement_forms
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplement_forms' AND policyname = 'Users can insert supplement forms') THEN
    CREATE POLICY "Users can insert supplement forms"
      ON supplement_forms
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplement_forms' AND policyname = 'Users can update supplement forms') THEN
    CREATE POLICY "Users can update supplement forms"
      ON supplement_forms
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplement_forms' AND policyname = 'Users can delete supplement forms') THEN
    CREATE POLICY "Users can delete supplement forms"
      ON supplement_forms
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;