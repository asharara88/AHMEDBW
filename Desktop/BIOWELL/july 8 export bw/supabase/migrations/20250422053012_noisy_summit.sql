/*
  # Create Supplement Stacks Table

  1. New Tables
    - `supplement_stacks`: Predefined supplement combinations for specific health goals
      - `id` (uuid, primary key)
      - `category` (text)
      - `name` (text)
      - `total_price` (numeric)
      - `components` (jsonb)

  2. Security
    - Enable RLS on supplement_stacks table
    - Add policy for public read access
*/

-- Create supplement_stacks table
create table if not exists supplement_stacks (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  total_price numeric not null,
  components jsonb not null
);

-- Enable RLS
alter table supplement_stacks enable row level security;

-- Add RLS policies
create policy "Anyone can view supplement stacks"
  on supplement_stacks for select
  using (true);

-- Insert initial data
insert into supplement_stacks (category, name, total_price, components) values
('Performance','Performance Stack (Hydrolyzed variant)',406.90,'[
  {"name":"Hydrolyzed Whey Protein Isolate","dosage":"907 g","price":260.00},
  {"name":"Micronized Creatine Monohydrate","dosage":"300 g","price":60.00},
  {"name":"L-Glutamine Powder","dosage":"300 g","price":86.90}
]'),
('Performance','Performance Stack (Isolate variant)',326.90,'[
  {"name":"Whey Protein Isolate","dosage":"907 g","price":180.00},
  {"name":"Micronized Creatine Monohydrate","dosage":"300 g","price":60.00},
  {"name":"L-Glutamine Powder","dosage":"300 g","price":86.90}
]'),
('Sleep / Recovery','Recovery Stack',222.00,'[
  {"name":"Scivation XTEND BCAA Powder","dosage":"30 servings","price":77.94},
  {"name":"Magnesium Citrate","dosage":"120 caps","price":57.10},
  {"name":"MuscleTech Platinum L-Glutamine","dosage":"300 g","price":86.90}
]'),
('Sleep / Recovery','Sleep & Relaxation Stack',148.00,'[
  {"name":"Natrol Melatonin","dosage":"5 mg, 60 tabs","price":49.00},
  {"name":"NOW Foods GABA","dosage":"500 mg, 120 caps","price":58.00},
  {"name":"Calmful Magnesium Powder","dosage":"200 g","price":41.00}
]'),
('Longevity','Longevity Stack',285.00,'[
  {"name":"Tru Niagen® Nicotinamide Riboside","dosage":"300 mg, 30 caps","price":180.00},
  {"name":"Life Extension Resveratrol","dosage":"200 mg, 60 caps","price":75.00},
  {"name":"Thorne Research Vitamin B6","dosage":"10 mg, 60 caps","price":30.00}
]'),
('Metabolic','Core Wellness Stack',171.23,'[
  {"name":"Centrum Men''s Multivitamin","dosage":"60 tabs","price":97.23},
  {"name":"NBL Natural Fish Oil Super Omega-3","dosage":"100 softgels","price":39.00},
  {"name":"Now Foods Vitamin D-3","dosage":"2000 IU, 120 softgels","price":35.00}
]'),
('Metabolic','Energy & Metabolism Stack',274.00,'[
  {"name":"Jarrow B-Right B-Complex","dosage":"60 caps","price":82.00},
  {"name":"NOW Foods CoQ10","dosage":"200 mg, 60 softgels","price":55.00},
  {"name":"Optimum Nutrition L-Carnitine","dosage":"500 mg, 60 caps","price":62.00},
  {"name":"Apple Cider Vinegar Gummies","dosage":"60 gummies","price":75.00}
]'),
('Metabolic','Glucose Control Stack',385.00,'[
  {"name":"Berberine HCl","dosage":"500 mg, 60 caps","price":110.00},
  {"name":"Chromium Picolinate","dosage":"200 mcg, 120 caps","price":65.00},
  {"name":"Alpha-Lipoic Acid","dosage":"600 mg, 60 caps","price":120.00},
  {"name":"Cinnamon Bark Extract","dosage":"500 mg, 120 caps","price":55.00},
  {"name":"Myo-Inositol","dosage":"500 mg, 120 caps","price":80.00}
]'),
('Fertility','Male Fertility Stack',242.00,'[
  {"name":"Thorne Zinc Picolinate","dosage":"30 mg, 180 caps","price":95.00},
  {"name":"Life Extension Male Multi","dosage":"60 caps","price":92.00},
  {"name":"Jarrow L-Carnitine","dosage":"500 mg, 60 caps","price":55.00}
]'),
('Fertility','Female Fertility Stack',228.00,'[
  {"name":"mykind Organics Prenatal Multi","dosage":"120 tabs","price":125.00},
  {"name":"Pure Encapsulations Myo-Inositol","dosage":"500 mg, 120 caps","price":63.00},
  {"name":"NOW Foods Folate","dosage":"800 mcg, 100 caps","price":40.00}
]'),
('Gut Health','Gut Health Stack',178.00,'[
  {"name":"Garden of Life Probiotics","dosage":"30 caps","price":110.00},
  {"name":"NOW Foods Inulin Prebiotic Fiber","dosage":"226 g","price":38.00},
  {"name":"Enzymedica Digest Gold Enzymes","dosage":"60 caps","price":30.00}
]'),
('Gut Health','Gut Comfort Stack (Most Comfort)',446.90,'[
  {"name":"Hydrolyzed Whey Isolate","dosage":"907 g","price":260.00},
  {"name":"L-Glutamine","dosage":"300 g","price":86.90},
  {"name":"Collagen Peptides","dosage":"300 g","price":100.00}
]');