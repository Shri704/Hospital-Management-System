import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const notificationSchema = new mongoose.Schema(
  {
    ...baseFields,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["info", "warning", "appointment", "billing", "system"],
      default: "info",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String, // optional redirect link (e.g., /appointments/123)
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for system notifications
    }
  },
  baseOptions
);

// Soft delete support
applySoftDelete(notificationSchema);

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
