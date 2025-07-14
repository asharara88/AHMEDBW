/*
  # Supplement Schema Updates

  1. Changes
    - Add new columns to the `supplements` table:
      - `form_type` (text, foreign key to supplement_forms.form_type)
      - `form_image_url` (text)
      - `goal` (text)
      - `mechanism` (text)
      - `evidence_summary` (text)
      - `source_link` (text)
  2. Security
    - Enable RLS on `supplements` table if not already enabled
    - Add policies for public read access and authenticated user management
  3. Triggers
    - Add trigger to update form_image_url when form_type changes
*/

-- Add new columns to supplements table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'form_type') THEN
    ALTER TABLE supplements ADD COLUMN form_type TEXT REFERENCES supplement_forms(form_type);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'form_image_url') THEN
    ALTER TABLE supplements ADD COLUMN form_image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'goal') THEN
    ALTER TABLE supplements ADD COLUMN goal TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'mechanism') THEN
    ALTER TABLE supplements ADD COLUMN mechanism TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'evidence_summary') THEN
    ALTER TABLE supplements ADD COLUMN evidence_summary TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'source_link') THEN
    ALTER TABLE supplements ADD COLUMN source_link TEXT;
  END IF;
END $$;

-- Enable Row Level Security on supplements if not already enabled
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

-- Create function to update form_image_url when form_type changes
CREATE OR REPLACE FUNCTION update_form_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.form_type IS NOT NULL THEN
    SELECT image_url INTO NEW.form_image_url FROM supplement_forms WHERE form_type = NEW.form_type;
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

-- Create policies for supplements if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplements' AND policyname = 'select_policy') THEN
    CREATE POLICY "select_policy" ON supplements
      FOR SELECT
      TO public
      USING (EXISTS (
        SELECT 1 FROM user_supplements
        WHERE user_supplements.supplement_id = supplements.id
        AND user_supplements.user_id = (SELECT uid())
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplements' AND policyname = 'insert_policy') THEN
    CREATE POLICY "insert_policy" ON supplements
      FOR INSERT
      TO public
      WITH CHECK (EXISTS (
        SELECT 1 FROM user_supplements
        WHERE user_supplements.supplement_id = supplements.id
        AND user_supplements.user_id = (SELECT uid())
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supplements' AND policyname = 'update_policy') THEN
    CREATE POLICY "update_policy" ON supplements
      FOR UPDATE
      TO public
      USING (EXISTS (
        SELECT 1 FROM user_supplements
        WHERE user_supplements.supplement_id = supplements.id
        AND user_supplements.user_id = (SELECT uid())
      ));
  END IF;
END $$;