import { Router } from "express";
import * as ctrl from "../controllers/dashboard.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";

const router = Router();

/**
 * @desc Dashboard statistics
 */
router.get(
  "/stats",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.getDashboardStats
);

/**
 * @desc Recent appointments for dashboard
 */
router.get(
  "/recent-appointments",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.getRecentAppointments
);

/**
 * @desc Recent patients list
 */
router.get(
  "/recent-patients",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.getRecentPatients
);

/**
 * @desc Revenue summary for charts
 */
router.get(
  "/revenue-summary",
  auth,
  permit("admin", "accountant"),
  ctrl.getRevenueSummary
);

export default router;
