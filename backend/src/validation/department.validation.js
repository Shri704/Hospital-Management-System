import Joi from "joi";

export const createDepartmentSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().allow("", null),
    head: Joi.string().allow("", null).hex().length(24), // ✅ allow first then validate ObjectId
  }),
  params: Joi.object(),
  query: Joi.object(),
});

export const updateDepartmentSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().allow("", null).optional(),
    head: Joi.string().allow("", null).hex().length(24).optional(), // ✅ same fix
  }),
  params: Joi.object(),
  query: Joi.object(),
});
