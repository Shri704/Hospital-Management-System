import { Router } from "express";
import * as ctrl from "../controllers/appointment.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  publicBookAppointmentSchema
} from "../validation/appointment.validation.js";

const router = Router();

// 📌 Public booking endpoint (no auth)
router.post("/book", validate(publicBookAppointmentSchema), ctrl.publicBook);

// 📌 Get all appointments (Admin, Doctor, Receptionist, Patient)
router.get(
  "/",
  auth,
  permit("admin", "doctor", "receptionist", "patient"),
  ctrl.list
);

// 📌 Create new appointment (Receptionist / Doctor / Admin / Patient)
router.post(
  "/",
  auth,
  permit("admin", "doctor", "receptionist", "patient"),
  validate(createAppointmentSchema),
  ctrl.create
);

// 📌 Get appointment by ID (Admin, Doctor, Receptionist, Patient)
router.get(
  "/:id",
  auth,
  permit("admin", "doctor", "receptionist", "patient"),
  ctrl.getOne
);

// 📌 Update appointment details (Admin, Doctor, Receptionist)
router.patch(
  "/:id",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.update
);

// 📌 Update only appointment status (confirmed, cancelled, completed)
router.patch(
  "/:id/status",
  auth,
  permit("admin", "doctor", "receptionist"),
  validate(updateAppointmentStatusSchema),
  ctrl.updateStatus
);

// 📌 Delete appointment (Admin only)
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
