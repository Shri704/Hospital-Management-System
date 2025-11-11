import rateLimit from "express-rate-limit";

/**
 * Global Rate Limiter
 * Limits requests from same IP to avoid brute force / DDoS
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

/**
 * Strict limiter for login endpoints (extra security)
 */
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // only 10 login attempts allowed
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts, try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
