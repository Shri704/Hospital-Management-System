import { Router } from "express";
import * as ctrl from "../controllers/notification.controller.js";
import { auth } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";

const router = Router();

/**
 * @route GET /api/notifications
 * @desc Get notifications for logged-in user
 * @access Logged in users
 */
router.get("/", auth, ctrl.list);

/**
 * @route POST /api/notifications
 * @desc Create notification (Admin/System use)
 * @access Admin only
 */
router.post("/", auth, permit("admin"), ctrl.create);

/**
 * @route PATCH /api/notifications/read/:id
 * @desc Mark single notification as read
 * @access Logged in users
 */
router.patch("/read/:id", auth, ctrl.markRead);

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Logged in users
 */
router.patch("/read-all", auth, ctrl.markAllRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Logged in users
 */
router.delete("/:id", auth, ctrl.remove);

export default router;
