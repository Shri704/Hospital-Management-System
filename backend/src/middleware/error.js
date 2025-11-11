import ApiError from "../utils/ApiError.js";

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
