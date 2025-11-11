import { Router } from "express";
import * as ctrl from "../controllers/doctor.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createDoctorSchema,
  updateDoctorSchema
} from "../validation/doctor.validation.js";

const router = Router();

/**
 * @route GET /api/doctors/public
 * @desc Public minimal doctors list
 */
router.get("/public", ctrl.listPublic);

/**
 * @route GET /api/doctors
 * @desc List all doctors
 * @access Admin, Receptionist, Doctor
 */
router.get(
  "/",
  auth,
  permit("admin", "receptionist", "doctor"),
  ctrl.list
);

/**
 * @route POST /api/doctors
 * @desc Create a new doctor
 * @access Admin only
 */
router.post(
  "/",
  auth,
  permit("admin"),
  validate(createDoctorSchema),
  ctrl.create
);

/**
 * @route GET /api/doctors/:id
 * @desc Get doctor by ID
 * @access Admin, Receptionist, Doctor
 */
router.get(
  "/:id",
  auth,
  permit("admin", "receptionist", "doctor"),
  ctrl.getOne
);

/**
 * @route PATCH /api/doctors/:id
 * @desc Update doctor details
 * @access Admin only
 */
router.patch(
  "/:id",
  auth,
  permit("admin"),
  validate(updateDoctorSchema),
  ctrl.update
);

/**
 * @route DELETE /api/doctors/:id
 * @desc Soft delete doctor
 * @access Admin only
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
