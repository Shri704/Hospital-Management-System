import Joi from "joi";

/**
 * Create Room Validation
 */
export const createRoomSchema = Joi.object({
  body: Joi.object({
    roomNumber: Joi.string().required().trim(),
    type: Joi.string()
      .valid("general", "private", "ICU", "emergency", "operation")
      .required(),
    capacity: Joi.number().min(1).default(1),
    occupiedBeds: Joi.number().min(0).default(0),
    status: Joi.string()
      .valid("available", "occupied", "maintenance")
      .default("available"),
    patient: Joi.array().items(Joi.string()).optional(),
    admittedDate: Joi.date().optional(),
    dischargedDate: Joi.date().optional()
  }),

  params: Joi.object(),
  query: Joi.object()
});

/**
 * Update Room Validation
 */
export const updateRoomSchema = Joi.object({
  body: Joi.object({
    roomNumber: Joi.string().optional().trim(),
    type: Joi.string()
      .valid("general", "private", "ICU", "emergency", "operation")
      .optional(),
    capacity: Joi.number().min(1).optional(),
    occupiedBeds: Joi.number().min(0).optional(),
    status: Joi.string()
      .valid("available", "occupied", "maintenance")
      .optional(),
    patient: Joi.array().items(Joi.string()).optional(),
    admittedDate: Joi.date().optional(),
    dischargedDate: Joi.date().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object()
});
