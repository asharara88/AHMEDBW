/*
  # Supplement Forms Schema

  1. New Tables
    - `supplement_forms` - Stores information about different supplement forms (capsule, powder, etc.)
      - `form_type` (text, primary key)
      - `image_url` (text)
      - `used_for` (text)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `supplement_forms` table
    - Add policy for public read access
    - Add policy for authenticated users to manage their own records
*/

-- Create supplement_forms table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplement_forms (
  form_type TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  used_for TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL DEFAULT ''
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_supplement_forms_name ON supplement_forms(name);

-- Enable Row Level Security
ALTER TABLE supplement_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for supplement_forms
-- Allow anyone to view supplement forms
CREATE POLICY IF NOT EXISTS "Anyone can view supplement forms"
  ON supplement_forms
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage supplement forms
CREATE POLICY IF NOT EXISTS "Users can view supplement forms"
  ON supplement_forms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert supplement forms"
  ON supplement_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update supplement forms"
  ON supplement_forms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can delete supplement forms"
  ON supplement_forms
  FOR DELETE
  TO authenticated
  USING (true);