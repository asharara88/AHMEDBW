import { Nutrition } from './Nutrition';
import { Review } from './Review';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  detailed_description?: string;
  key_benefits: string[];
  ingredients?: string;
  serving_size?: string;
  servings_per_container?: number;
  directions_for_use?: string;
  warnings?: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  image_url?: string;
  nutrition_facts?: Record<string, any>;
  certifications?: string;
  target_audience?: string;
  health_conditions?: string;
  allergen_info?: string;
  manufacturer?: string;
  country_of_origin?: string;
  expiry_date?: string;
  barcode?: string;
  sku?: string;
  weight_grams?: number;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  form_type?: string;
  form_image_url?: string;
  
  // Relationships
  nutrition?: Nutrition;
  reviews?: Review[];
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  price_min?: number;
  price_max?: number;
  is_available?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  tags?: string[];
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
}