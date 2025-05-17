/*
  # Add Complete Supplement Data

  1. Changes
    - Add all 30 supplements with detailed information
    - Create supplement stacks for different categories
    - Include pricing, dosage, and benefits information

  2. Categories
    - Sleep & Recovery
    - Cognitive Performance
    - Metabolic Health
    - Gut Health
    - Heart Health
    - Performance
    - Fertility
    - Immune Support
*/

-- Insert individual supplements
INSERT INTO supplements (name, description, benefits, dosage, price, image_url, is_active) VALUES
-- Sleep & Recovery Category
('Magnesium Glycinate', 'Premium magnesium supplement for sleep and recovery', 
 ARRAY['Sleep quality', 'Muscle recovery', 'Stress reduction'], 
 '300-400mg before bed', 49.99,
 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg', true),

('L-Theanine', 'Natural amino acid for relaxation and focus',
 ARRAY['Relaxation', 'Mental focus', 'Sleep quality'],
 '200mg as needed', 34.99,
 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg', true),

('Ashwagandha', 'Traditional adaptogenic herb for stress and sleep',
 ARRAY['Stress reduction', 'Sleep support', 'Hormone balance'],
 '600mg daily', 39.99,
 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg', true),

-- Cognitive Performance Category
('Lions Mane Mushroom', 'Cognitive enhancement and nerve health support',
 ARRAY['Memory', 'Focus', 'Nerve health'],
 '500-1000mg daily', 44.99,
 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg', true),

('Alpha-GPC', 'Advanced choline source for brain function',
 ARRAY['Memory', 'Focus', 'Brain health'],
 '300mg daily', 54.99,
 'https://images.pexels.com/photos/3683053/pexels-photo-3683053.jpeg', true),

('Bacopa Monnieri', 'Traditional herb for memory and learning',
 ARRAY['Memory', 'Learning', 'Stress reduction'],
 '300mg daily', 39.99,
 'https://images.pexels.com/photos/3683055/pexels-photo-3683055.jpeg', true),

-- Metabolic Health Category
('Berberine', 'Natural compound for metabolic health',
 ARRAY['Blood sugar', 'Metabolism', 'Gut health'],
 '500mg 2-3x daily', 59.99,
 'https://images.pexels.com/photos/3683057/pexels-photo-3683057.jpeg', true),

('Alpha Lipoic Acid', 'Powerful antioxidant for metabolic support',
 ARRAY['Blood sugar', 'Antioxidant', 'Energy'],
 '600mg daily', 49.99,
 'https://images.pexels.com/photos/3683059/pexels-photo-3683059.jpeg', true),

('Chromium Picolinate', 'Essential mineral for glucose metabolism',
 ARRAY['Blood sugar', 'Metabolism', 'Appetite'],
 '200mcg daily', 29.99,
 'https://images.pexels.com/photos/3683061/pexels-photo-3683061.jpeg', true),

-- Gut Health Category
('Premium Probiotics', 'Multi-strain probiotic blend',
 ARRAY['Gut health', 'Immunity', 'Digestion'],
 '30 billion CFU daily', 54.99,
 'https://images.pexels.com/photos/3683063/pexels-photo-3683063.jpeg', true),

('L-Glutamine', 'Amino acid for gut lining support',
 ARRAY['Gut health', 'Recovery', 'Immunity'],
 '5g daily', 39.99,
 'https://images.pexels.com/photos/3683065/pexels-photo-3683065.jpeg', true),

('Digestive Enzymes', 'Comprehensive enzyme blend',
 ARRAY['Digestion', 'Nutrient absorption', 'Gut comfort'],
 '1-2 capsules with meals', 44.99,
 'https://images.pexels.com/photos/3683067/pexels-photo-3683067.jpeg', true),

-- Heart Health Category
('Omega-3 Fish Oil', 'High-potency EPA/DHA formula',
 ARRAY['Heart health', 'Brain health', 'Joint health'],
 '2000mg daily', 49.99,
 'https://images.pexels.com/photos/3683069/pexels-photo-3683069.jpeg', true),

('CoQ10', 'Premium Coenzyme Q10 supplement',
 ARRAY['Heart health', 'Energy', 'Antioxidant'],
 '100-200mg daily', 59.99,
 'https://images.pexels.com/photos/3683071/pexels-photo-3683071.jpeg', true),

('Plant Sterols', 'Natural cholesterol support',
 ARRAY['Heart health', 'Cholesterol', 'Cardiovascular'],
 '800mg daily', 44.99,
 'https://images.pexels.com/photos/3683073/pexels-photo-3683073.jpeg', true),

-- Performance Category
('Creatine Monohydrate', 'Pure micronized creatine',
 ARRAY['Strength', 'Performance', 'Recovery'],
 '5g daily', 34.99,
 'https://images.pexels.com/photos/3683075/pexels-photo-3683075.jpeg', true),

('Beta-Alanine', 'Endurance and performance support',
 ARRAY['Endurance', 'Performance', 'Recovery'],
 '3-6g daily', 39.99,
 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg', true),

('BCAA Complex', 'Branch chain amino acids blend',
 ARRAY['Recovery', 'Muscle', 'Performance'],
 '5-10g daily', 44.99,
 'https://images.pexels.com/photos/3683079/pexels-photo-3683079.jpeg', true),

-- Fertility Category
('Fertility Support (Men)', 'Comprehensive male fertility blend',
 ARRAY['Sperm health', 'Hormone balance', 'Vitality'],
 'As directed', 64.99,
 'https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg', true),

('Fertility Support (Women)', 'Complete female fertility formula',
 ARRAY['Egg quality', 'Hormone balance', 'Reproductive health'],
 'As directed', 64.99,
 'https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg', true),

-- Immune Support Category
('Vitamin D3+K2', 'Optimized vitamin D formula',
 ARRAY['Immune health', 'Bone health', 'Heart health'],
 '5000 IU daily', 39.99,
 'https://images.pexels.com/photos/3683085/pexels-photo-3683085.jpeg', true),

('Zinc Picolinate', 'High-absorption zinc formula',
 ARRAY['Immune health', 'Skin health', 'Hormone balance'],
 '15-30mg daily', 29.99,
 'https://images.pexels.com/photos/3683087/pexels-photo-3683087.jpeg', true),

('Quercetin', 'Natural flavonoid supplement',
 ARRAY['Immune support', 'Antioxidant', 'Anti-inflammatory'],
 '500mg daily', 44.99,
 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg', true);

-- Insert supplement stacks
INSERT INTO supplement_stacks (category, name, total_price, components) VALUES
('Sleep & Recovery', 'Ultimate Sleep Stack', 124.97, '[
  {"name": "Magnesium Glycinate", "dosage": "300-400mg", "price": 49.99},
  {"name": "L-Theanine", "dosage": "200mg", "price": 34.99},
  {"name": "Ashwagandha", "dosage": "600mg", "price": 39.99}
]'),

('Cognitive', 'Brain Performance Stack', 139.97, '[
  {"name": "Lions Mane Mushroom", "dosage": "500-1000mg", "price": 44.99},
  {"name": "Alpha-GPC", "dosage": "300mg", "price": 54.99},
  {"name": "Bacopa Monnieri", "dosage": "300mg", "price": 39.99}
]'),

('Metabolic', 'Blood Sugar Support Stack', 139.97, '[
  {"name": "Berberine", "dosage": "500mg", "price": 59.99},
  {"name": "Alpha Lipoic Acid", "dosage": "600mg", "price": 49.99},
  {"name": "Chromium Picolinate", "dosage": "200mcg", "price": 29.99}
]'),

('Gut Health', 'Digestive Health Stack', 139.97, '[
  {"name": "Premium Probiotics", "dosage": "30 billion CFU", "price": 54.99},
  {"name": "L-Glutamine", "dosage": "5g", "price": 39.99},
  {"name": "Digestive Enzymes", "dosage": "As directed", "price": 44.99}
]'),

('Heart', 'Cardiovascular Support Stack', 154.97, '[
  {"name": "Omega-3 Fish Oil", "dosage": "2000mg", "price": 49.99},
  {"name": "CoQ10", "dosage": "100-200mg", "price": 59.99},
  {"name": "Plant Sterols", "dosage": "800mg", "price": 44.99}
]'),

('Performance', 'Athletic Performance Stack', 119.97, '[
  {"name": "Creatine Monohydrate", "dosage": "5g", "price": 34.99},
  {"name": "Beta-Alanine", "dosage": "3-6g", "price": 39.99},
  {"name": "BCAA Complex", "dosage": "5-10g", "price": 44.99}
]'),

('Fertility', 'Fertility Support Stack', 129.98, '[
  {"name": "Fertility Support (Men)", "dosage": "As directed", "price": 64.99},
  {"name": "Fertility Support (Women)", "dosage": "As directed", "price": 64.99}
]'),

('Immune', 'Immune Defense Stack', 114.97, '[
  {"name": "Vitamin D3+K2", "dosage": "5000 IU", "price": 39.99},
  {"name": "Zinc Picolinate", "dosage": "15-30mg", "price": 29.99},
  {"name": "Quercetin", "dosage": "500mg", "price": 44.99}
]');