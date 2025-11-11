import { Router } from "express";
import * as ctrl from "../controllers/room.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createRoomSchema,
  updateRoomSchema
} from "../validation/room.validation.js";

const router = Router();

/**
 * @route GET /api/rooms
 * @desc Get all rooms
 * @access Admin, Receptionist
 */
router.get(
  "/",
  auth,
  permit("admin", "receptionist"),
  ctrl.list
);

/**
 * @route POST /api/rooms
 * @desc Create room
 * @access Admin
 */
router.post(
  "/",
  auth,
  permit("admin"),
  validate(createRoomSchema),
  ctrl.create
);

/**
 * @route GET /api/rooms/:id
 * @desc Get single room
 * @access Admin, Receptionist
 */
router.get(
  "/:id",
  auth,
  permit("admin", "receptionist"),
  ctrl.getOne
);

/**
 * @route PATCH /api/rooms/:id
 * @desc Update room
 * @access Admin
 */
router.patch(
  "/:id",
  auth,
  permit("admin"),
  validate(updateRoomSchema),
  ctrl.update
);

/**
 * @route DELETE /api/rooms/:id
 * @desc Soft delete room
 * @access Admin
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
