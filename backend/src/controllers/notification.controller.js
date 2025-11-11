import Notification from "../models/Notification.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import httpStatus from "http-status";

/**
 * @desc Get Logged-in User Notifications
 * @route GET /api/notifications
 * @access Private
 */
export const list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json(
    new ApiResponse({
      message: "Notifications fetched",
      data: items,
    })
  );
});

/**
 * @desc Create Notification (Admin/System)
 * @route POST /api/notifications
 * @access Admin
 */
export const create = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "Notification created",
      data: notification,
    })
  );
});

/**
 * @desc Mark Notification as Read
 * @route PATCH /api/notifications/read/:id
 * @access Private
 */
export const markRead = asyncHandler(async (req, res) => {
  const note = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!note) throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");

  res.json(
    new ApiResponse({
      message: "Notification marked as read",
      data: note,
    })
  );
});

/**
 * @desc Mark All Notifications as Read
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
export const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json(
    new ApiResponse({
      message: "All notifications marked as read",
      data: { updatedCount: result.modifiedCount },
    })
  );
});

/**
 * @desc Delete Notification
 * @route DELETE /api/notifications/:id
 * @access Private(User) / Admin
 */
export const remove = asyncHandler(async (req, res) => {
  const note = await Notification.findByIdAndDelete(req.params.id);

  if (!note) throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");

  res.json(new ApiResponse({ message: "Notification deleted" }));
});
