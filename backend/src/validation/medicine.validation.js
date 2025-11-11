import Joi from "joi";

/**
 * Create Medicine Validation
 */
export const createMedicineSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required().trim(),
    description: Joi.string().allow("", null),
    category: Joi.string().allow("", null),
    stock: Joi.number().min(0).default(0),
    unit: Joi.string().default("tablet"),
    price: Joi.number().min(0).default(0),
    expiryDate: Joi.date().optional().allow("", null),
  }),

  params: Joi.object(),
  query: Joi.object(),
});

/**
 * Update Medicine Validation
 */
export const updateMedicineSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().optional().trim(),
    description: Joi.string().allow("", null),
    category: Joi.string().allow("", null),
    stock: Joi.number().min(0).optional(),
    unit: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    expiryDate: Joi.date().optional().allow("", null),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});
