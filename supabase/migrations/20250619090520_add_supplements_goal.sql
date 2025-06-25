/*
  # Add supplement goals and seed data
*/
ALTER TABLE IF EXISTS supplements ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE IF EXISTS supplements ADD COLUMN IF NOT EXISTS mechanism TEXT;
ALTER TABLE IF EXISTS supplements ADD COLUMN IF NOT EXISTS evidence_summary TEXT;
ALTER TABLE IF EXISTS supplements ADD COLUMN IF NOT EXISTS source_link TEXT;

INSERT INTO supplements (name, description, price, goal, mechanism, dosage, evidence_summary, source_link) VALUES
  ('Ashwagandha', 'Seed data', 0, 'stress/sleep', 'cortisol reduction via HPA axis', '300-600mg/day', 'cortisol reduced by 27%', 'https://pubmed.ncbi.nlm.nih.gov/23439798/'),
  ('Hydrolyzed Whey', 'Seed data', 0, 'muscle', 'fast leucine delivery for MPS', '20-40g post-exercise', 'faster MPS than isolate', 'https://pubmed.ncbi.nlm.nih.gov/19164836/'),
  ('Magnesium Glycinate', 'Seed data', 0, 'sleep', 'supports GABA/circadian rhythm', '200-400mg', 'improved sleep onset in older adults', 'https://pubmed.ncbi.nlm.nih.gov/23853635/');
