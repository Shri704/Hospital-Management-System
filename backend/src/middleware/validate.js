import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Validate request body/query/params using Joi schema
 * Example usage:
 * router.post("/", validate(createSchema), controllerFn)
 */
export const validate = (schema) => (req, res, next) => {
  const data = {
    body: req.body,
    params: req.params,
    query: req.query,
  };

  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);

    return next(
      new ApiError(
        httpStatus.BAD_REQUEST,
        `Validation error`,
        errors
      )
    );
  }

  return next();
};
