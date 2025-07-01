-- Create supplement_forms table if it doesn't exist
CREATE TABLE IF NOT EXISTS supplement_forms (
  form_type TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  used_for TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on supplement_forms
ALTER TABLE supplement_forms ENABLE ROW LEVEL SECURITY;

-- Create policy for supplement_forms if it doesn't exist
CREATE POLICY IF NOT EXISTS "Anyone can view supplement forms" 
  ON supplement_forms
  FOR SELECT 
  TO public 
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

-- Add form_type foreign key to supplements table if it doesn't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS form_type TEXT REFERENCES supplement_forms(form_type);

-- Add form_image_url to supplements table if it doesn't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS form_image_url TEXT;

-- Add goal to supplements table if it doesn't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS goal TEXT;

-- Add mechanism to supplements table if it doesn't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS mechanism TEXT;

-- Add evidence_summary to supplements table if it doesn't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS evidence_summary TEXT;

-- Add source_link to supplements table if it doesn't exist
ALTER TABLE supplements ADD COLUMN IF NOT EXISTS source_link TEXT;

-- Create a function to update form_image_url based on form_type
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

-- Create a trigger to update form_image_url when form_type is inserted or updated
DROP TRIGGER IF EXISTS update_supplement_form_image ON supplements;
CREATE TRIGGER update_supplement_form_image
BEFORE INSERT OR UPDATE OF form_type ON supplements
FOR EACH ROW
EXECUTE FUNCTION update_form_image_url();