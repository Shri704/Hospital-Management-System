import Joi from "joi";

/**
 * Create User Validation (Admin creates staff/user)
 */
export const createUserSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),

    email: Joi.string()
      .email()
      .required()
      .trim(),

    phone: Joi.string().optional().allow("", null),

    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters long"
      }),

    role: Joi.string()
      .valid(
        "admin",
        "doctor",
        "receptionist",
        "pharmacist",
        "accountant",
        "patient"
      )
      .required(),

    isActive: Joi.boolean().optional()
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Update User Validation
 */
export const updateUserSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().optional().trim(),
    lastName: Joi.string().optional().trim(),
    email: Joi.string().email().optional().trim(),
    phone: Joi.string().optional(),
    password: Joi.string().min(6).optional(),

    role: Joi.string()
      .valid(
        "admin",
        "doctor",
        "receptionist",
        "pharmacist",
        "accountant",
        "patient"
      )
      .optional(),

    isActive: Joi.boolean().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object()
});
