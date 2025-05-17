import { Supplement } from '../types/supplements';

export const supplements: Supplement[] = [
  {
    id: 'magnesium-glycinate',
    name: 'Magnesium Glycinate',
    description: 'Premium form of magnesium for optimal absorption and sleep support.',
    categories: ['Sleep', 'Recovery', 'Stress'],
    evidence_level: 'Green',
    use_cases: ['Sleep quality', 'Muscle recovery', 'Stress management'],
    stack_recommendations: ['Sleep Stack', 'Recovery Stack'],
    dosage: '300-400mg before bed',
    form: 'Capsule',
    brand: 'Pure Encapsulations',
    availability: true,
    price_aed: 89,
    image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg'
  },
  {
    id: 'vitamin-d3-k2',
    name: 'Vitamin D3 + K2',
    description: 'Synergistic combination for optimal calcium utilization and immune support.',
    categories: ['Immunity', 'Bone Health'],
    evidence_level: 'Green',
    use_cases: ['Immune support', 'Bone health', 'Cardiovascular health'],
    stack_recommendations: ['Immunity Stack', 'Bone Health Stack'],
    dosage: '5000 IU D3 / 100mcg K2',
    form: 'Softgel',
    brand: 'Thorne Research',
    availability: true,
    price_aed: 75,
    image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg'
  },
  {
    id: 'omega-3',
    name: 'Omega-3 Fish Oil',
    description: 'High-potency EPA/DHA from sustainable sources for brain and heart health.',
    categories: ['Brain Health', 'Heart Health', 'Inflammation'],
    evidence_level: 'Green',
    use_cases: ['Cognitive function', 'Heart health', 'Joint health'],
    stack_recommendations: ['Brain Health Stack', 'Heart Health Stack'],
    dosage: '2-3g daily (1000mg EPA/DHA)',
    form: 'Softgel',
    brand: 'Nordic Naturals',
    availability: true,
    price_aed: 120,
    image_url: 'https://images.pexels.com/photos/4004626/pexels-photo-4004626.jpeg'
  },
  {
    id: 'berberine',
    name: 'Berberine HCl',
    description: 'Powerful compound for metabolic health and glucose management.',
    categories: ['Metabolic Health', 'Blood Sugar'],
    evidence_level: 'Green',
    use_cases: ['Blood sugar control', 'Metabolic health', 'Gut health'],
    stack_recommendations: ['Metabolic Stack'],
    dosage: '500mg 2-3x daily',
    form: 'Capsule',
    brand: 'Thorne Research',
    availability: true,
    price_aed: 95,
    image_url: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg'
  },
  {
    id: 'lions-mane',
    name: "Lion's Mane Mushroom",
    description: 'Nootropic mushroom for cognitive enhancement and nerve health.',
    categories: ['Cognitive', 'Brain Health'],
    evidence_level: 'Yellow',
    use_cases: ['Mental clarity', 'Memory', 'Nerve health'],
    stack_recommendations: ['Cognitive Stack'],
    dosage: '1000mg 1-2x daily',
    form: 'Capsule',
    brand: 'Host Defense',
    availability: true,
    price_aed: 110,
    image_url: 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg'
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha KSM-66',
    description: 'Premium ashwagandha extract for stress and anxiety support.',
    categories: ['Stress', 'Sleep', 'Recovery'],
    evidence_level: 'Green',
    use_cases: ['Stress reduction', 'Sleep quality', 'Recovery'],
    stack_recommendations: ['Stress Stack', 'Sleep Stack'],
    dosage: '600mg daily',
    form: 'Capsule',
    brand: 'Jarrow Formulas',
    availability: true,
    price_aed: 85,
    image_url: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg'
  }
];

export const supplementStacks = [
  {
    id: 'sleep-stack',
    name: 'Sleep & Recovery Stack',
    description: 'Comprehensive support for sleep quality and recovery',
    category: 'Sleep',
    supplements: ['magnesium-glycinate', 'ashwagandha'],
    total_price: 174
  },
  {
    id: 'brain-stack',
    name: 'Brain Health Stack',
    description: 'Optimize cognitive function and mental clarity',
    category: 'Brain Health',
    supplements: ['lions-mane', 'omega-3'],
    total_price: 230
  },
  {
    id: 'metabolic-stack',
    name: 'Metabolic Health Stack',
    description: 'Support healthy blood sugar and metabolism',
    category: 'Metabolic Health',
    supplements: ['berberine', 'vitamin-d3-k2'],
    total_price: 170
  }
];