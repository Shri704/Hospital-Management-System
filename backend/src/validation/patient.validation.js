import Joi from "joi";

/**
 * Create Patient Validation
 */
export const createPatientSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),

    email: Joi.string()
      .email()
      .optional()
      .allow("", null)
      .trim(),

    phone: Joi.string().required().trim(),

    gender: Joi.string()
      .valid("male", "female", "other")
      .required(),

    dateOfBirth: Joi.date().optional().allow("", null),

    bloodGroup: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "")
      .optional(),

    address: Joi.object({
      street: Joi.string().allow("", null),
      city: Joi.string().allow("", null),
      state: Joi.string().allow("", null),
      zip: Joi.string().allow("", null),
    }).optional(),

    emergencyContact: Joi.object({
      name: Joi.string().allow("", null),
      relation: Joi.string().allow("", null),
      phone: Joi.string().allow("", null),
    }).optional(),

    medicalHistory: Joi.string().allow("", null),
    insuranceProvider: Joi.string().allow("", null),
    insuranceNumber: Joi.string().allow("", null)
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Update Patient Validation
 */
export const updatePatientSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().optional().trim(),
    lastName: Joi.string().optional().trim(),
    email: Joi.string().email().optional().allow("", null).trim(),
    phone: Joi.string().optional().trim(),

    gender: Joi.string()
      .valid("male", "female", "other")
      .optional(),

    dateOfBirth: Joi.date().optional().allow("", null),

    bloodGroup: Joi.string()
      .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
      .optional(),

    address: Joi.object({
      street: Joi.string().allow("", null),
      city: Joi.string().allow("", null),
      state: Joi.string().allow("", null),
      zip: Joi.string().allow("", null),
    }).optional(),

    emergencyContact: Joi.object({
      name: Joi.string().allow("", null),
      relation: Joi.string().allow("", null),
      phone: Joi.string().allow("", null),
    }).optional(),

    medicalHistory: Joi.string().allow("", null),
    insuranceProvider: Joi.string().allow("", null),
    insuranceNumber: Joi.string().allow("", null)
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object()
});
