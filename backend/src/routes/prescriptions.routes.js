import { Router } from "express";
import * as ctrl from "../controllers/prescription.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from "../validation/prescription.validation.js";

const router = Router();

router.get("/", auth, permit("admin", "doctor", "pharmacist"), ctrl.list);
router.post("/", auth, permit("admin", "doctor"), validate(createPrescriptionSchema), ctrl.create);
router.get("/:id", auth, permit("admin", "doctor", "pharmacist"), ctrl.getOne);
router.patch("/:id", auth, permit("admin", "doctor"), validate(updatePrescriptionSchema), ctrl.update);
router.delete("/:id", auth, permit("admin"), ctrl.remove);

export default router;
