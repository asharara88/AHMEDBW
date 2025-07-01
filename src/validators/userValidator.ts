import Joi from 'joi';

/**
 * Validate user registration data
 * @param data User data to validate
 * @param isUpdate Whether this is an update operation (some fields optional)
 */
export const validateUserData = (data: any, isUpdate: boolean = false): { valid: boolean; errors: any[] } => {
  const schema = Joi.object({
    email: isUpdate ? Joi.string().email().optional() : Joi.string().email().required(),
    password: isUpdate ? Joi.string().min(8).optional() : Joi.string().min(8).required(),
    current_password: Joi.string().when('password', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    first_name: isUpdate ? Joi.string().optional() : Joi.string().required(),
    last_name: isUpdate ? Joi.string().optional() : Joi.string().required(),
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

/**
 * Validate login data
 * @param data Login data to validate
 */
export const validateLoginData = (data: any): { valid: boolean; errors: any[] } => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
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