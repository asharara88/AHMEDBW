import Joi from 'joi';

/**
 * Validate order data
 * @param data Order data to validate
 */
export const validateOrderData = (data: any): { valid: boolean; errors: any[] } => {
  const schema = Joi.object({
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