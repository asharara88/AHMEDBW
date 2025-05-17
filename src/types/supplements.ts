export interface Supplement {
  id: string;
  name: string;
  description: string;
  categories: string[];
  evidence_level: 'Green' | 'Yellow' | 'Red';
  use_cases: string[];
  stack_recommendations: string[];
  dosage: string;
  form: string;
  form_type?: string;
  form_image_url?: string;
  brand: string;
  availability: boolean;
  price_aed: number;
  image_url: string;
}

export interface SupplementStack {
  id: string;
  name: string;
  description: string;
  category: string;
  supplements: string[];
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupplementForm {
  form_type: string;
  image_url: string;
  used_for: string;
}