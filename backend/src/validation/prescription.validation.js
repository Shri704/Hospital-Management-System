import Joi from "joi";

// Single medicine entry item
const medicationSchema = Joi.object({
  medicine: Joi.string().required().trim(),     // Medicine ID or name
  dosage: Joi.string().required().trim(),       // "500mg"
  frequency: Joi.string().required().trim(),    // "2 times/day"
  duration: Joi.string().required().trim(),     // "5 days"
  instructions: Joi.string().allow("", null),   // Optional notes (e.g., "after meals")
});

/**
 * Create Prescription Validation
 */
export const createPrescriptionSchema = Joi.object({
  body: Joi.object({
    patient: Joi.string().required().trim(),      // Patient ID
    doctor: Joi.string().required().trim(),       // Doctor ID
    appointment: Joi.string().optional().allow("", null),
    
    medications: Joi.array()
      .items(medicationSchema)
      .min(1)
      .required(),

    notes: Joi.string().allow("", null),
    followUpDate: Joi.date().optional().allow("", null),
  }),

  params: Joi.object(),
  query: Joi.object(),
});

/**
 * Update Prescription Validation
 */
export const updatePrescriptionSchema = Joi.object({
  body: Joi.object({
    patient: Joi.string().optional().trim(),
    doctor: Joi.string().optional().trim(),
    appointment: Joi.string().optional().allow("", null),

    medications: Joi.array().items(medicationSchema).optional(),

    notes: Joi.string().allow("", null),
    followUpDate: Joi.date().optional().allow("", null),
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object(),
});
