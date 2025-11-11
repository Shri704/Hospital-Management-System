import { Router } from "express";
import * as ctrl from "../controllers/department.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validation/department.validation.js";

const router = Router();

router.get(
  "/",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.list
);

router.post(
  "/",
  auth,
  permit("admin"),
  validate(createDepartmentSchema),
  ctrl.create
);

router.get(
  "/:id",
  auth,
  permit("admin", "doctor", "receptionist"),
  ctrl.getOne
);

router.patch(
  "/:id",
  auth,
  permit("admin"),
  validate(updateDepartmentSchema),
  ctrl.update
);

router.delete("/:id", auth, permit("admin"), ctrl.remove);

export default router;

