import Joi from "joi";

export const createAppointmentSchema = Joi.object({
  body: Joi.object({
    patient: Joi.string().required().trim(),
    doctor: Joi.string().required().trim(),
    date: Joi.date().required(),
    timeSlot: Joi.string().required().trim(), // "10:00 AM - 10:30 AM"
    reason: Joi.string().allow("", null),
    status: Joi.string().valid(
      "pending",
      "confirmed",
      "completed",
      "cancelled"
    ).default("pending")
  }),
  params: Joi.object(),
  query: Joi.object()
});

export const updateAppointmentStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "completed", "cancelled")
      .required()
  }),
  params: Joi.object({
    id: Joi.string().required()
  }),
  query: Joi.object()
});

export const publicBookAppointmentSchema = Joi.object({
  body: Joi.object({
    patientId: Joi.string().optional(),
    patientInfo: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional().allow(null, ""),
      gender: Joi.string().valid("male", "female", "other").optional()
    }).optional(),
    doctor: Joi.string().required(),
    date: Joi.date().required(),
    timeSlot: Joi.string().required(),
    reason: Joi.string().optional().allow("", null)
  }).xor("patientId", "patientInfo"),
  params: Joi.object(),
  query: Joi.object()
});