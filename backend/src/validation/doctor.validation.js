import Joi from "joi";

/**
 * Create Doctor Validation
 */
export const createDoctorSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    phone: Joi.string().allow("", null),
    specialization: Joi.string().required().trim(),
    department: Joi.string().optional().allow(null, ""),
    experienceYears: Joi.number().min(0).default(0),
    consultationFee: Joi.number().min(0).default(0),
    bio: Joi.string().allow("", null),

    availability: Joi.array()
      .items(
        Joi.object({
          day: Joi.string().trim(),
          startTime: Joi.string().trim(),
          endTime: Joi.string().trim()
        })
      )
      .optional()
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Update Doctor Validation
 */
export const updateDoctorSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().optional().trim(),
    lastName: Joi.string().optional().trim(),
    email: Joi.string().email().optional().trim(),
    phone: Joi.string().optional(),
    specialization: Joi.string().optional().trim(),
    department: Joi.string().optional().allow(null, ""),
    experienceYears: Joi.number().min(0).optional(),
    consultationFee: Joi.number().min(0).optional(),
    bio: Joi.string().allow("", null),

    availability: Joi.array()
      .items(
        Joi.object({
          day: Joi.string().trim(),
          startTime: Joi.string().trim(),
          endTime: Joi.string().trim()
        })
      )
      .optional()
  }),

  params: Joi.object(),
  query: Joi.object()
});
