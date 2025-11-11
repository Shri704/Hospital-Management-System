import Joi from "joi";

/**
 * Create Medical Record Validation
 */
export const createRecordSchema = Joi.object({
  body: Joi.object({
    patient: Joi.string().required(),
    doctor: Joi.string().required(),
    diagnosis: Joi.string().required().trim(),
    secondaryDiagnosis: Joi.string().optional().allow("", null).trim(),
    medicalHistory: Joi.string().optional().allow("", null).trim(),
    familyHistory: Joi.string().optional().allow("", null).trim(),
    symptoms: Joi.string().optional().allow("", null).trim(),
    notes: Joi.string().optional().allow("", null).trim(),
    vitals: Joi.object({
      bloodPressure: Joi.string().optional().allow("", null).trim(),
      pulse: Joi.string().optional().allow("", null).trim(),
      temperature: Joi.string().optional().allow("", null).trim(),
      respirationRate: Joi.string().optional().allow("", null).trim(),
      spo2: Joi.string().optional().allow("", null).trim(),
      weight: Joi.string().optional().allow("", null).trim(),
    }).optional(),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        dosage: Joi.string().required().trim(),
        duration: Joi.string().required().trim(),
      })
    ).optional(),
    treatmentPlan: Joi.string().optional().allow("", null).trim(),
    tests: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        result: Joi.string().optional().allow("", null).trim(),
        date: Joi.date().optional().allow(null),
      })
    ).optional(),
    surgeryDetails: Joi.array().items(
      Joi.object({
        name: Joi.string().optional().allow("", null).trim(),
        date: Joi.date().optional().allow(null),
        outcome: Joi.string().optional().allow("", null).trim(),
        notes: Joi.string().optional().allow("", null).trim(),
      })
    ).optional(),
    progressNotes: Joi.string().optional().allow("", null).trim(),
    doctorNotes: Joi.string().optional().allow("", null).trim(),
    nursingNotes: Joi.string().optional().allow("", null).trim(),
    dischargeSummary: Joi.string().optional().allow("", null).trim(),
    followUpInstructions: Joi.string().optional().allow("", null).trim(),
    documents: Joi.array().items(
      Joi.object({
        title: Joi.string().optional().allow("", null).trim(),
        type: Joi.string().optional().allow("", null).trim(),
        url: Joi.string().optional().allow("", null).trim(),
        notes: Joi.string().optional().allow("", null).trim(),
      })
    ).optional(),
    consentForms: Joi.array().items(
      Joi.object({
        type: Joi.string().optional().allow("", null).trim(),
        signedBy: Joi.string().optional().allow("", null).trim(),
        relation: Joi.string().optional().allow("", null).trim(),
        date: Joi.date().optional().allow(null),
        notes: Joi.string().optional().allow("", null).trim(),
      })
    ).optional(),
    followUpDate: Joi.date().optional().allow(null),
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Update Medical Record Validation
 */
export const updateRecordSchema = Joi.object({
  body: Joi.object({
    patient: Joi.string().optional(),
    doctor: Joi.string().optional(),
    diagnosis: Joi.string().optional().trim(),
    secondaryDiagnosis: Joi.string().optional().allow("", null).trim(),
    medicalHistory: Joi.string().optional().allow("", null).trim(),
    familyHistory: Joi.string().optional().allow("", null).trim(),
    symptoms: Joi.string().optional().allow("", null).trim(),
    notes: Joi.string().optional().allow("", null).trim(),
    vitals: Joi.object({
      bloodPressure: Joi.string().optional().allow("", null).trim(),
      pulse: Joi.string().optional().allow("", null).trim(),
      temperature: Joi.string().optional().allow("", null).trim(),
      respirationRate: Joi.string().optional().allow("", null).trim(),
      spo2: Joi.string().optional().allow("", null).trim(),
      weight: Joi.string().optional().allow("", null).trim(),
    }).optional(),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        dosage: Joi.string().required().trim(),
        duration: Joi.string().required().trim(),
      })
    ).optional(),
    treatmentPlan: Joi.string().optional().allow("", null).trim(),
    tests: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        result: Joi.string().optional().allow("", null).trim(),
        date: Joi.date().optional().allow(null),
      })
    ).optional(),
    surgeryDetails: Joi.array().items(
      Joi.object({
        name: Joi.string().optional().allow("", null).trim(),
        date: Joi.date().optional().allow(null),
        outcome: Joi.string().optional().allow("", null).trim(),
        notes: Joi.string().optional().allow("", null).trim(),
      })
    ).optional(),
    progressNotes: Joi.string().optional().allow("", null).trim(),
    doctorNotes: Joi.string().optional().allow("", null).trim(),
    nursingNotes: Joi.string().optional().allow("", null).trim(),
    dischargeSummary: Joi.string().optional().allow("", null).trim(),
    followUpInstructions: Joi.string().optional().allow("", null).trim(),
    documents: Joi.array().items(
      Joi.object({
        title: Joi.string().optional().allow("", null).trim(),
        type: Joi.string().optional().allow("", null).trim(),
        url: Joi.string().optional().allow("", null).trim(),
        notes: Joi.string().optional().allow("", null).trim(),
      })
    ).optional(),
    consentForms: Joi.array().items(
      Joi.object({
        type: Joi.string().optional().allow("", null).trim(),
        signedBy: Joi.string().optional().allow("", null).trim(),
        relation: Joi.string().optional().allow("", null).trim(),
        date: Joi.date().optional().allow(null),
        notes: Joi.string().optional().allow("", null).trim(),
      })
    ).optional(),
    followUpDate: Joi.date().optional().allow(null),
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object()
});

