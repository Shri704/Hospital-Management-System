import Joi from "joi";

/**
 * Register user validation
 */
export const registerSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
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
      .default("patient"),
    phone: Joi.string().allow("", null)
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Login validation
 */
export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required()
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Refresh token validation (optional)
 */
export const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required()
  }),
  
  params: Joi.object(),
  query: Joi.object()
});
