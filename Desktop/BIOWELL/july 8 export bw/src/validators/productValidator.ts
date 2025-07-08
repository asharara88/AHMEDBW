import Joi from 'joi';

/**
 * Validate product data
 * @param data Product data to validate
 * @param isUpdate Whether this is an update operation (some fields optional)
 */
export const validateProductData = (data: any, isUpdate: boolean = false): { valid: boolean; errors: any[] } => {
  const schema = Joi.object({
    name: isUpdate ? Joi.string().optional() : Joi.string().required(),
    brand: isUpdate ? Joi.string().optional() : Joi.string().required(),
    category: isUpdate ? Joi.string().optional() : Joi.string().required(),
    subcategory: Joi.string().optional(),
    description: isUpdate ? Joi.string().optional() : Joi.string().required(),
    detailed_description: Joi.string().optional(),
    key_benefits: Joi.array().items(Joi.string()).optional(),
    ingredients: Joi.string().optional(),
    serving_size: Joi.string().optional(),
    servings_per_container: Joi.number().optional(),
    directions_for_use: Joi.string().optional(),
    warnings: Joi.string().optional(),
    price: isUpdate ? Joi.number().min(0).optional() : Joi.number().min(0).required(),
    compare_at_price: Joi.number().min(0).optional(),
    currency: Joi.string().default('USD'),
    stock_quantity: isUpdate ? Joi.number().min(0).optional() : Joi.number().min(0).required(),
    is_available: Joi.boolean().default(true),
    is_featured: Joi.boolean().default(false),
    is_bestseller: Joi.boolean().default(false),
    image_url: Joi.string().uri().optional(),
    nutrition_facts: Joi.object().optional(),
    certifications: Joi.string().optional(),
    target_audience: Joi.string().optional(),
    health_conditions: Joi.string().optional(),
    allergen_info: Joi.string().optional(),
    manufacturer: Joi.string().optional(),
    country_of_origin: Joi.string().optional(),
    expiry_date: Joi.string().optional(),
    barcode: Joi.string().optional(),
    sku: Joi.string().optional(),
    weight_grams: Joi.number().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    seo_title: Joi.string().optional(),
    seo_description: Joi.string().optional(),
    form_type: Joi.string().optional(),
    form_image_url: Joi.string().uri().optional(),
    
    // Nutrition data
    nutrition: Joi.object({
      ingredients: Joi.string().required(),
      allergens: Joi.array().items(Joi.string()).optional(),
      daily_values: Joi.object().optional(),
      storage_info: Joi.string().optional(),
      batch_number: Joi.string().optional()
    }).optional()
  });
  
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
};