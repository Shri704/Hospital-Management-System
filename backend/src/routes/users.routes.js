import { Router } from "express";
import * as ctrl from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema
} from "../validation/user.validation.js";

const router = Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Admin only
 */
router.get(
  "/",
  auth,
  permit("admin"),
  ctrl.list
);

/**
 * @route POST /api/users
 * @desc Create a user (Admin panel add staff)
 * @access Admin only
 */
router.post(
  "/",
  auth,
  permit("admin"),
  validate(createUserSchema),
  ctrl.create
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Admin only
 */
router.get(
  "/:id",
  auth,
  permit("admin"),
  ctrl.getOne
);

/**
 * @route PATCH /api/users/:id
 * @desc Update user info
 * @access Admin only
 */
router.patch(
  "/:id",
  auth,
  permit("admin"),
  validate(updateUserSchema),
  ctrl.update
);

/**
 * @route DELETE /api/users/:id
 * @desc Soft delete user
 * @access Admin only
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
