import { Router } from "express";
import * as ctrl from "../controllers/patient.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createPatientSchema,
  updatePatientSchema
} from "../validation/patient.validation.js";

const router = Router();

/**
 * @route GET /api/patients
 * @desc Get all patients
 * @access Admin, Doctor, Receptionist
 */
router.get(
  "/",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.list
);

/**
 * @route POST /api/patients
 * @desc Create a new patient
 * @access Admin, Receptionist, Doctor
 */
router.post(
  "/",
  auth,
  permit("admin", "receptionist", "doctor"),
  validate(createPatientSchema),
  ctrl.create
);

/**
 * @route GET /api/patients/:id
 * @desc Get single patient by ID
 * @access Admin, Doctor, Receptionist
 */
router.get(
  "/:id",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.getOne
);

/**
 * @route PATCH /api/patients/:id
 * @desc Update patient info
 * @access Admin, Receptionist, Doctor
 */
router.patch(
  "/:id",
  auth,
  permit("admin", "receptionist", "doctor"),
  validate(updatePatientSchema),
  ctrl.update
);

/**
 * @route DELETE /api/patients/:id
 * @desc Soft delete patient
 * @access Admin only
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
