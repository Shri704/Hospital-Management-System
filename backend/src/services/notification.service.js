import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Create Notification
 */
export const createNotificationService = async ({
  user,
  title,
  message,
  type = "info",
  link = null,
  createdBy = null,
}) => {
  return Notification.create({
    user,
    title,
    message,
    type,
    link,
    createdBy,
  });
};

/**
 * Get notifications for a user
 */
export const getUserNotificationsService = async (userId) => {
  return Notification.find({
    user: userId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

/**
 * Mark single notification read
 */
export const markNotificationReadService = async (id, userId) => {
  const notification = await Notification.findOne({ _id: id, user: userId });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsReadService = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } }
  );

  return { message: "All notifications marked as read" };
};

/**
 * Delete Notification (Soft Delete)
 */
export const deleteNotificationService = async (id, userId) => {
  const notification = await Notification.findOne({ _id: id, user: userId });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }

  notification.isDeleted = true;
  await notification.save();

  return notification;
};
