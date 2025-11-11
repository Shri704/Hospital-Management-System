import { Router } from "express";
import * as ctrl from "../controllers/auditLog.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";

const router = Router();

/**
 * @route GET /api/audit-logs
 * @desc Get all audit logs (filter by user, action, date)
 * @access Admin only
 */
router.get(
  "/",
  auth,
  permit("admin"),
  ctrl.list
);

/**
 * @route GET /api/audit-logs/:id
 * @desc Get a single audit log entry
 * @access Admin only
 */
router.get(
  "/:id",
  auth,
  permit("admin"),
  ctrl.getOne
);

export default router;
