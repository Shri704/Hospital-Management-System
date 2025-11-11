import Joi from "joi";

/**
 * Create Room Validation
 */
export const createRoomSchema = Joi.object({
  body: Joi.object({
    roomNumber: Joi.string().required().trim(),
    type: Joi.string()
      .valid("general", "private", "icu", "emergency", "ward")
      .required(),
    capacity: Joi.number().min(1).default(1),
    occupied: Joi.number().min(0).default(0),
    status: Joi.string()
      .valid("available", "occupied", "maintenance")
      .default("available")
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
      .valid("general", "private", "icu", "emergency", "ward")
      .optional(),
    capacity: Joi.number().min(1).optional(),
    occupied: Joi.number().min(0).optional(),
    status: Joi.string()
      .valid("available", "occupied", "maintenance")
      .optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  query: Joi.object()
});
