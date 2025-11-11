import Joi from "joi";

/**
 * Create Invoice Validation Schema
 */
export const createInvoiceSchema = Joi.object({
  body: Joi.object({
    patient: Joi.string().required().trim(),
    doctor: Joi.string().required().trim(),
    appointment: Joi.string().optional().allow(null, ""),

    invoiceNumber: Joi.string().optional().trim(),
    invoiceDate: Joi.date().optional(),

    department: Joi.string().optional().trim(),

    patientDetails: Joi.object({
      name: Joi.string().optional().allow("", null),
      admissionNumber: Joi.string().optional().allow("", null),
      contact: Joi.string().optional().allow("", null),
    }).optional(),

    hospitalDetails: Joi.object({
      name: Joi.string().optional().allow("", null),
      address: Joi.string().optional().allow("", null),
      contact: Joi.string().optional().allow("", null),
    }).optional(),

    items: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().trim(),
          quantity: Joi.number().min(1).required(),
          unitPrice: Joi.number().min(0).required(),
        })
      )
      .min(1)
      .required(),

    tax: Joi.number().min(0).max(100).default(0),
    discount: Joi.number().min(0).max(100).default(0),

    amountPaid: Joi.number().min(0).optional(),

    paymentMethod: Joi.string()
      .valid("cash", "card", "upi", "insurance", "other")
      .default("cash"),

    insuranceDetails: Joi.object({
      provider: Joi.string().optional().allow("", null),
      policyNumber: Joi.string().optional().allow("", null),
      coverageAmount: Joi.number().min(0).optional(),
      coveragePercentage: Joi.number().min(0).max(100).optional(),
    }).optional(),

    signatures: Joi.object({
      billingStaff: Joi.string().optional().allow("", null),
      patient: Joi.string().optional().allow("", null),
    }).optional(),

    notes: Joi.string().optional().allow("", null),
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Update Invoice Validation Schema
 */
export const updateInvoiceSchema = Joi.object({
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().trim(),
          quantity: Joi.number().min(1).required(),
          unitPrice: Joi.number().min(0).required()
        })
      )
      .optional(),

    tax: Joi.number().min(0).max(100).optional(),
    discount: Joi.number().min(0).max(100).optional(),
    amountPaid: Joi.number().min(0).optional(),
    doctor: Joi.string().optional(),
    department: Joi.string().optional(),
    patientDetails: Joi.object({
      name: Joi.string().optional().allow("", null),
      admissionNumber: Joi.string().optional().allow("", null),
      contact: Joi.string().optional().allow("", null),
    }).optional(),
    hospitalDetails: Joi.object({
      name: Joi.string().optional().allow("", null),
      address: Joi.string().optional().allow("", null),
      contact: Joi.string().optional().allow("", null),
    }).optional(),
    insuranceDetails: Joi.object({
      provider: Joi.string().optional().allow("", null),
      policyNumber: Joi.string().optional().allow("", null),
      coverageAmount: Joi.number().min(0).optional(),
      coveragePercentage: Joi.number().min(0).max(100).optional(),
    }).optional(),
    signatures: Joi.object({
      billingStaff: Joi.string().optional().allow("", null),
      patient: Joi.string().optional().allow("", null),
    }).optional(),
    notes: Joi.string().optional().allow("", null),

    status: Joi.string()
      .valid("pending", "paid", "cancelled")
      .optional(),

    paymentMethod: Joi.string()
      .valid("cash", "card", "upi", "insurance", "other")
      .optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object()
});
