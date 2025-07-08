/*
  # Add Supplement Form Types and Images

  1. New Tables
    - `supplement_forms`: Stores form types and their associated images
    - Maps different supplement forms to their visual representations

  2. Changes
    - Add form_type column to supplements table
    - Add form_image_url column to supplements table
    - Create supplement_forms table with predefined form types and images
    - Add foreign key constraint from supplements to supplement_forms

  3. Security
    - Enable RLS on supplement_forms table
    - Add policy for public read access
*/

-- Create supplement_forms table
CREATE TABLE IF NOT EXISTS supplement_forms (
  form_type TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  used_for TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add form columns to supplements table
ALTER TABLE supplements 
ADD COLUMN IF NOT EXISTS form_type TEXT REFERENCES supplement_forms(form_type),
ADD COLUMN IF NOT EXISTS form_image_url TEXT;

-- Enable RLS
ALTER TABLE supplement_forms ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can view supplement forms"
  ON supplement_forms FOR SELECT
  USING (true);

-- Insert form types
INSERT INTO supplement_forms (form_type, image_url, used_for) VALUES
  ('softgel', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gel%20capsule%20ChatGPT%20Image%20May%204,%202025,%2006_50_42%20AM.png?token=7LqcdP_VcICkC1b-0Y4uFq9iapjjnU32JUEitEp3OTY', 'Omega-3, Vitamin D3, CoQ10, Krill Oil'),
  ('capsule_solid', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/hard%20capsule.png?token=zstccXQIPhIofjVDRe1DlNtc1sw3VCLyjz4vxjIJkV8', 'Zinc, Magnesium, Vitamin B Complex'),
  ('capsule_powder', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo', 'Rhodiola, Ashwagandha, Tongkat Ali, Berberine'),
  ('powder_large', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/protein%20generic%20gpt%20transoarent%20bg.png?token=D9gHlznz7L95OpBe14-v4Hm1Dr0nE71eaN94pd2jfKU', 'Whey Protein, Casein, Meal Replacement'),
  ('powder_fine', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/creatine%20and%20other.png?token=REPLACE_THIS_IF_EXPIRED', 'Creatine, Beta-Alanine, L-Glutamine'),
  ('liquid_bottle', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/drops%20bottle.png?token=REPLACE_THIS_IF_EXPIRED', 'CBD, Vitamin D3 Drops, Melatonin Drops'),
  ('gummy', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gummies.png?token=REPLACE_THIS_IF_EXPIRED', 'Multivitamin Gummies, Biotin, Melatonin, Kids Vitamins'),
  ('stick_pack', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/stick%20packs.png?token=REPLACE_THIS_IF_EXPIRED', 'Electrolytes, Greens Powder, Collagen Peptides, Pre-Workout'),
  ('effervescent', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/effervesent.png?token=REPLACE_THIS_IF_EXPIRED', 'Vitamin C, Magnesium Efferv., Hydration Tablets');

-- Assign default form types based on supplement names and descriptions
UPDATE supplements SET form_type = 
  CASE 
    WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%vitamin d%' OR LOWER(name) LIKE '%coq10%' THEN 'softgel'
    WHEN LOWER(name) LIKE '%powder%' OR LOWER(name) LIKE '%creatine%' OR LOWER(name) LIKE '%protein%' THEN 'powder_large'
    WHEN LOWER(name) LIKE '%gummy%' OR LOWER(name) LIKE '%gummies%' THEN 'gummy'
    WHEN LOWER(name) LIKE '%liquid%' OR LOWER(name) LIKE '%drops%' THEN 'liquid_bottle'
    WHEN LOWER(name) LIKE '%pack%' OR LOWER(name) LIKE '%sachet%' THEN 'stick_pack'
    WHEN LOWER(name) LIKE '%effervescent%' OR LOWER(name) LIKE '%tablet%' THEN 'effervescent'
    ELSE 'capsule_powder'
  END;

-- Update form_image_url based on form_type
UPDATE supplements SET form_image_url = (
  SELECT image_url FROM supplement_forms WHERE supplement_forms.form_type = supplements.form_type
);

-- Create trigger to update form_image_url when form_type changes
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

CREATE TRIGGER update_supplement_form_image
BEFORE INSERT OR UPDATE OF form_type ON supplements
FOR EACH ROW
EXECUTE FUNCTION update_form_image_url();