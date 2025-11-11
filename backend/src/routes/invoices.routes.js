import { Router } from "express";
import * as ctrl from "../controllers/invoice.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import { 
  createInvoiceSchema, 
  updateInvoiceSchema 
} from "../validation/invoice.validation.js";

const router = Router();

/**
 * @route GET /api/invoices
 * @desc List invoices
 * @access Admin, Accountant
 */
router.get(
  "/",
  auth,
  permit("admin", "accountant"),
  ctrl.list
);

/**
 * @route POST /api/invoices
 * @desc Create invoice
 * @access Admin, Accountant
 */
router.post(
  "/",
  auth,
  permit("admin", "accountant"),
  validate(createInvoiceSchema),
  ctrl.create
);

/**
 * @route PATCH /api/invoices/:id/pay
 * @desc Mark invoice as paid
 * @access Admin, Accountant
 * NOTE: This route must come before /:id to avoid route conflicts
 */
router.patch(
  "/:id/pay",
  auth,
  permit("admin", "accountant"),
  ctrl.markPaid
);

/**
 * @route GET /api/invoices/:id
 * @desc Get invoice by ID
 * @access Admin, Accountant
 */
router.get(
  "/:id",
  auth,
  permit("admin", "accountant"),
  ctrl.getOne
);

/**
 * @route PATCH /api/invoices/:id
 * @desc Update invoice
 * @access Admin, Accountant
 */
router.patch(
  "/:id",
  auth,
  permit("admin", "accountant"),
  validate(updateInvoiceSchema),
  ctrl.update
);

/**
 * @route DELETE /api/invoices/:id
 * @desc Delete invoice (soft delete)
 * @access Admin only
 */
router.delete(
  "/:id",
  auth,
  permit("admin"),
  ctrl.remove
);

export default router;
