export interface Nutrition {
  id: string;
  product_id: string;
  ingredients: string;
  allergens?: string[];
  daily_values?: Record<string, any>;
  storage_info?: string;
  batch_number?: string;
  created_at: Date;
  updated_at: Date;
}