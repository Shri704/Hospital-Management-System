import { Router } from "express";
import * as ctrl from "../controllers/medicine.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createMedicineSchema,
  updateMedicineSchema
} from "../validation/medicine.validation.js";

const router = Router();

/**
 * @route GET /api/medicine
 * @desc Get all medicines
 * @access Admin, Pharmacist, Doctor
 */
router.get(
  "/",
  auth,
  permit("admin", "pharmacist", "doctor"),
  ctrl.list
);

/**
 * @route POST /api/medicine
 * @desc Create medicine
 * @access Admin, Pharmacist
 */
router.post(
  "/",
  auth,
  permit("admin", "pharmacist"),
  validate(createMedicineSchema),
  ctrl.create
);

/**
 * @route GET /api/medicine/:id
 * @desc Get medicine by ID
 * @access Admin, Pharmacist, Doctor
 */
router.get(
  "/:id",
  auth,
  permit("admin", "pharmacist", "doctor"),
  ctrl.getOne
);

/**
 * @route PATCH /api/medicine/:id
 * @desc Update medicine
 * @access Admin, Pharmacist
 */
router.patch(
  "/:id",
  auth,
  permit("admin", "pharmacist"),
  validate(updateMedicineSchema),
  ctrl.update
);

/**
 * @route DELETE /api/medicine/:id
 * @desc Delete medicine (soft delete)
 * @access Admin only
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
