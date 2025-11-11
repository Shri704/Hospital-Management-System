import { Router } from "express";
import * as ctrl from "../controllers/record.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createRecordSchema,
  updateRecordSchema
} from "../validation/record.validation.js";

const router = Router();

/**
 * @route GET /api/records
 * @desc Get all medical records (with optional filters)
 * @access Admin, Doctor
 */
router.get(
  "/",
  auth,
  permit("admin", "doctor"),
  ctrl.list
);

/**
 * @route GET /api/records/patient/:patientId
 * @desc Get all medical records for a patient
 * @access Admin, Doctor
 */
router.get(
  "/patient/:patientId",
  auth,
  permit("admin", "doctor"),
  ctrl.listByPatient
);

/**
 * @route POST /api/records
 * @desc Create new medical record
 * @access Admin, Doctor
 */
router.post(
  "/",
  auth,
  permit("admin", "doctor"),
  validate(createRecordSchema),
  ctrl.create
);

/**
 * @route GET /api/records/:id
 * @desc Get a medical record by ID
 * @access Admin, Doctor
 */
router.get(
  "/:id",
  auth,
  permit("admin", "doctor"),
  ctrl.getOne
);

/**
 * @route PATCH /api/records/:id
 * @desc Update medical record
 * @access Admin, Doctor
 */
router.patch(
  "/:id",
  auth,
  permit("admin", "doctor"),
  validate(updateRecordSchema),
  ctrl.update
);

/**
 * @route DELETE /api/records/:id
 * @desc Delete a medical record
 * @access Admin only
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
