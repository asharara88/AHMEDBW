/*
  # Create Supplement Forms Table and Update Supplements

  1. New Tables
    - `supplement_forms`: Defines different physical forms of supplements
      - `form_type` (text, primary key)
      - `image_url` (text)
      - `used_for` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `form_type` and `form_image_url` columns to supplements table
    - Create foreign key relationship between supplements and supplement_forms

  3. Automation
    - Create trigger to automatically update form_image_url when form_type changes
    - Populate initial form types and assign to existing supplements

  4. Security
    - Enable RLS on supplement_forms table
    - Add policy for public read access
*/

-- Check if supplement_forms table exists before creating
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'supplement_forms') THEN
    -- Create supplement_forms table
    CREATE TABLE supplement_forms (
      form_type TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      used_for TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

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
      ('powder_fine', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/creatine%20and%20other.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzdXBwbGVtZW50cy9jcmVhdGluZSBhbmQgb3RoZXIucG5nIiwiaWF0IjoxNzE0NzY4MzIzLCJleHAiOjE3NzgwNDgzMjN9.8JwY9hZJdCNHeWOGRzUBo5tGKBdVKT5eJ5lYpyLLTkU', 'Creatine, Beta-Alanine, L-Glutamine'),
      ('liquid_bottle', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/drops%20bottle.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzdXBwbGVtZW50cy9kcm9wcyBib3R0bGUucG5nIiwiaWF0IjoxNzE0NzY4MzIzLCJleHAiOjE3NzgwNDgzMjN9.8JwY9hZJdCNHeWOGRzUBo5tGKBdVKT5eJ5lYpyLLTkU', 'CBD, Vitamin D3 Drops, Melatonin Drops'),
      ('gummy', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gummies.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzdXBwbGVtZW50cy9ndW1taWVzLnBuZyIsImlhdCI6MTcxNDc2ODMyMywiZXhwIjoxNzc4MDQ4MzIzfQ.8JwY9hZJdCNHeWOGRzUBo5tGKBdVKT5eJ5lYpyLLTkU', 'Multivitamin Gummies, Biotin, Melatonin, Kids Vitamins'),
      ('stick_pack', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/stick%20packs.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzdXBwbGVtZW50cy9zdGljayBwYWNrcy5wbmciLCJpYXQiOjE3MTQ3NjgzMjMsImV4cCI6MTc3ODA0ODMyM30.8JwY9hZJdCNHeWOGRzUBo5tGKBdVKT5eJ5lYpyLLTkU', 'Electrolytes, Greens Powder, Collagen Peptides, Pre-Workout'),
      ('effervescent', 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/effervesent.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzdXBwbGVtZW50cy9lZmZlcnZlc2VudC5wbmciLCJpYXQiOjE3MTQ3NjgzMjMsImV4cCI6MTc3ODA0ODMyM30.8JwY9hZJdCNHeWOGRzUBo5tGKBdVKT5eJ5lYpyLLTkU', 'Vitamin C, Magnesium Efferv., Hydration Tablets');
  END IF;
END $$;

-- Add form columns to supplements table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'form_type') THEN
    ALTER TABLE supplements ADD COLUMN form_type TEXT REFERENCES supplement_forms(form_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'form_image_url') THEN
    ALTER TABLE supplements ADD COLUMN form_image_url TEXT;
  END IF;
END $$;

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
  END
WHERE form_type IS NULL;

-- Update form_image_url based on form_type
UPDATE supplements SET form_image_url = (
  SELECT image_url FROM supplement_forms WHERE supplement_forms.form_type = supplements.form_type
)
WHERE form_type IS NOT NULL AND form_image_url IS NULL;

-- Create or replace trigger function
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_supplement_form_image ON supplements;

-- Create trigger
CREATE TRIGGER update_supplement_form_image
BEFORE INSERT OR UPDATE OF form_type ON supplements
FOR EACH ROW
EXECUTE FUNCTION update_form_image_url();