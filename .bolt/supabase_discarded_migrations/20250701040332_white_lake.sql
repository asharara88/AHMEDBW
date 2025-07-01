/*
  # Supplement Schema

  1. Tables
    - `supplement_forms`: Stores information about different supplement forms
    - Updates to `supplements` table with additional columns
  
  2. Features
    - Automatic form image URL updates via trigger
  
  3. Security
    - Row Level Security with appropriate policies
*/

-- Create supplement_forms table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplement_forms (
  form_type TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  used_for TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT DEFAULT ''
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_supplement_forms_name ON supplement_forms(name);

-- Enable Row Level Security
ALTER TABLE supplement_forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view supplement forms" ON supplement_forms;
DROP POLICY IF EXISTS "Users can view supplement forms" ON supplement_forms;
DROP POLICY IF EXISTS "Users can insert supplement forms" ON supplement_forms;
DROP POLICY IF EXISTS "Users can update supplement forms" ON supplement_forms;
DROP POLICY IF EXISTS "Users can delete supplement forms" ON supplement_forms;

-- Create policies for supplement_forms
CREATE POLICY "Anyone can view supplement forms"
  ON supplement_forms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view supplement forms"
  ON supplement_forms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert supplement forms"
  ON supplement_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update supplement forms"
  ON supplement_forms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete supplement forms"
  ON supplement_forms
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default supplement forms
INSERT INTO supplement_forms (form_type, image_url, used_for)
VALUES 
  ('softgel', 'https://images.pexels.com/photos/139655/pexels-photo-139655.jpeg?auto=compress&cs=tinysrgb&w=800', 'Oil-based supplements'),
  ('capsule_solid', 'https://images.pexels.com/photos/143654/pexels-photo-143654.jpeg?auto=compress&cs=tinysrgb&w=800', 'Solid supplements'),
  ('capsule_powder', 'https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=800', 'Powdered supplements'),
  ('powder_large', 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg?auto=compress&cs=tinysrgb&w=800', 'Protein and meal replacements'),
  ('powder_fine', 'https://images.pexels.com/photos/4004626/pexels-photo-4004626.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mixing with liquids'),
  ('liquid_bottle', 'https://images.pexels.com/photos/4004613/pexels-photo-4004613.jpeg?auto=compress&cs=tinysrgb&w=800', 'Liquid supplements'),
  ('gummy', 'https://images.pexels.com/photos/4004614/pexels-photo-4004614.jpeg?auto=compress&cs=tinysrgb&w=800', 'Chewable supplements'),
  ('stick_pack', 'https://images.pexels.com/photos/4004615/pexels-photo-4004615.jpeg?auto=compress&cs=tinysrgb&w=800', 'Single-serving use'),
  ('effervescent', 'https://images.pexels.com/photos/4004616/pexels-photo-4004616.jpeg?auto=compress&cs=tinysrgb&w=800', 'Dissolves in water')
ON CONFLICT (form_type) DO UPDATE
SET 
  image_url = EXCLUDED.image_url,
  used_for = EXCLUDED.used_for,
  updated_at = now();

-- Add columns to supplements table if they don't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS form_type TEXT REFERENCES supplement_forms(form_type);
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS form_image_url TEXT;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS mechanism TEXT;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS evidence_summary TEXT;
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS source_link TEXT;

-- Create function to update form_image_url based on form_type
CREATE OR REPLACE FUNCTION update_form_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.form_type IS NOT NULL THEN
    SELECT image_url INTO NEW.form_image_url
    FROM supplement_forms
    WHERE form_type = NEW.form_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update form_image_url when form_type changes
DROP TRIGGER IF EXISTS update_supplement_form_image ON supplements;
CREATE TRIGGER update_supplement_form_image
  BEFORE INSERT OR UPDATE OF form_type ON supplements
  FOR EACH ROW
  EXECUTE FUNCTION update_form_image_url();

-- Enable Row Level Security on supplements
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "select_policy" ON supplements;
DROP POLICY IF EXISTS "insert_policy" ON supplements;
DROP POLICY IF EXISTS "update_policy" ON supplements;

-- Create policies for supplements
CREATE POLICY IF NOT EXISTS "select_policy" ON supplements
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM user_supplements
    WHERE user_supplements.supplement_id = supplements.id
    AND user_supplements.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "insert_policy" ON supplements
  FOR INSERT
  TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_supplements
    WHERE user_supplements.supplement_id = supplements.id
    AND user_supplements.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "update_policy" ON supplements
  FOR UPDATE
  TO public
  USING (EXISTS (
    SELECT 1 FROM user_supplements
    WHERE user_supplements.supplement_id = supplements.id
    AND user_supplements.user_id = auth.uid()
  ));