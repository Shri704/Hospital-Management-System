import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../validation/auth.validation.js";
import { auth } from "../middleware/auth.js";

const router = Router();

/**
 * @route POST /api/auth/register
 */
router.post(
  "/register",
  validate(registerSchema),
  ctrl.register
);

/**
 * @route POST /api/auth/login
 */
router.post(
  "/login",
  validate(loginSchema),
  ctrl.login
);

/**
 * @route POST /api/auth/refresh-token
 */
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  ctrl.refreshToken
);

/**
 * @route POST /api/auth/logout
 */
router.post(
  "/logout",
  auth,
  ctrl.logout
);

/**
 * @route GET /api/auth/me
 */
router.get(
  "/me",
  auth,
  ctrl.getMe
);

export default router;
