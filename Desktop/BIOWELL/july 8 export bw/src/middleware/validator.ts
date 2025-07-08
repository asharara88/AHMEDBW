import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validate request middleware
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Get the route path
  const path = req.path;
  const method = req.method;
  
  // Define validation schema based on route
  let schema;
  
  if (path.match(/^\/api\/v1\/products\/?$/) && method === 'POST') {
    schema = Joi.object({
      name: Joi.string().required(),
      brand: Joi.string().required(),
      category: Joi.string().required(),
      subcategory: Joi.string().optional(),
      description: Joi.string().required(),
      detailed_description: Joi.string().optional(),
      key_benefits: Joi.array().items(Joi.string()).optional(),
      ingredients: Joi.string().optional(),
      serving_size: Joi.string().optional(),
      servings_per_container: Joi.number().optional(),
      directions_for_use: Joi.string().optional(),
      warnings: Joi.string().optional(),
      price: Joi.number().required().min(0),
      compare_at_price: Joi.number().optional().min(0),
      currency: Joi.string().default('USD'),
      stock_quantity: Joi.number().required().min(0),
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
      seo_description: Joi.string().optional()
    });
  } else if (path.match(/^\/api\/v1\/products\/[^/]+\/?$/) && method === 'PUT') {
    schema = Joi.object({
      name: Joi.string().optional(),
      brand: Joi.string().optional(),
      category: Joi.string().optional(),
      subcategory: Joi.string().optional(),
      description: Joi.string().optional(),
      detailed_description: Joi.string().optional(),
      key_benefits: Joi.array().items(Joi.string()).optional(),
      ingredients: Joi.string().optional(),
      serving_size: Joi.string().optional(),
      servings_per_container: Joi.number().optional(),
      directions_for_use: Joi.string().optional(),
      warnings: Joi.string().optional(),
      price: Joi.number().optional().min(0),
      compare_at_price: Joi.number().optional().min(0),
      currency: Joi.string().optional(),
      stock_quantity: Joi.number().optional().min(0),
      is_available: Joi.boolean().optional(),
      is_featured: Joi.boolean().optional(),
      is_bestseller: Joi.boolean().optional(),
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
      seo_description: Joi.string().optional()
    });
  } else if (path.match(/^\/api\/v1\/users\/register\/?$/) && method === 'POST') {
    schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      phone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postal_code: Joi.string().required(),
        country: Joi.string().required(),
        is_default: Joi.boolean().default(true)
      }).optional(),
      health_data: Joi.object({
        age: Joi.number().optional(),
        gender: Joi.string().optional(),
        weight: Joi.number().optional(),
        height: Joi.number().optional(),
        activity_level: Joi.string().optional(),
        health_goals: Joi.array().items(Joi.string()).optional(),
        allergies: Joi.array().items(Joi.string()).optional(),
        medical_conditions: Joi.array().items(Joi.string()).optional(),
        current_supplements: Joi.array().items(Joi.string()).optional()
      }).optional(),
      preferences: Joi.object({
        email_notifications: Joi.boolean().default(true),
        sms_notifications: Joi.boolean().default(false),
        marketing_emails: Joi.boolean().default(true),
        preferred_categories: Joi.array().items(Joi.string()).optional(),
        dietary_preferences: Joi.array().items(Joi.string()).optional()
      }).optional()
    });
  } else if (path.match(/^\/api\/v1\/users\/login\/?$/) && method === 'POST') {
    schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
  } else if (path.match(/^\/api\/v1\/users\/profile\/?$/) && method === 'PUT') {
    schema = Joi.object({
      first_name: Joi.string().optional(),
      last_name: Joi.string().optional(),
      phone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postal_code: Joi.string().required(),
        country: Joi.string().required(),
        is_default: Joi.boolean().default(true)
      }).optional(),
      health_data: Joi.object({
        age: Joi.number().optional(),
        gender: Joi.string().optional(),
        weight: Joi.number().optional(),
        height: Joi.number().optional(),
        activity_level: Joi.string().optional(),
        health_goals: Joi.array().items(Joi.string()).optional(),
        allergies: Joi.array().items(Joi.string()).optional(),
        medical_conditions: Joi.array().items(Joi.string()).optional(),
        current_supplements: Joi.array().items(Joi.string()).optional()
      }).optional(),
      preferences: Joi.object({
        email_notifications: Joi.boolean().optional(),
        sms_notifications: Joi.boolean().optional(),
        marketing_emails: Joi.boolean().optional(),
        preferred_categories: Joi.array().items(Joi.string()).optional(),
        dietary_preferences: Joi.array().items(Joi.string()).optional()
      }).optional(),
      password: Joi.string().min(8).optional(),
      current_password: Joi.string().when('password', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    });
  } else if (path.match(/^\/api\/v1\/orders\/?$/) && method === 'POST') {
    schema = Joi.object({
      items: Joi.array().items(
        Joi.object({
          product_id: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required()
        })
      ).min(1).required(),
      shipping_info: Joi.object({
        address: Joi.object({
          street: Joi.string().required(),
          city: Joi.string().required(),
          state: Joi.string().required(),
          postal_code: Joi.string().required(),
          country: Joi.string().required()
        }).required(),
        shipping_method: Joi.string().required()
      }).required(),
      payment_details: Joi.object({
        payment_method: Joi.string().valid('credit_card', 'paypal', 'apple_pay', 'google_pay').required(),
        transaction_id: Joi.string().required(),
        status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required(),
        last_four: Joi.string().optional(),
        card_type: Joi.string().optional()
      }).required(),
      shipping_cost: Joi.number().min(0).optional()
    });
  } else if (path.match(/^\/api\/v1\/orders\/[^/]+\/status\/?$/) && method === 'PUT') {
    schema = Joi.object({
      status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').required()
    });
  } else {
    // No validation needed for this route
    next();
    return;
  }
  
  // Validate request body
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors
    });
    return;
  }
  
  next();
};