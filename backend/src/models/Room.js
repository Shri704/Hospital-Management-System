import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const roomSchema = new mongoose.Schema(
  {
    ...baseFields,

    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["general", "private", "ICU", "emergency", "operation"],
      default: "general",
    },

    capacity: {
      type: Number,
      default: 1,
    },

    occupiedBeds: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },

    patient: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        default: null,
      }
    ],

    admittedDate: {
      type: Date,
      required: false,
    },

    dischargedDate: {
      type: Date,
      required: false,
    }
  },
  baseOptions
);

// Soft Delete Behavior
applySoftDelete(roomSchema);

// Indexes
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ status: 1 });

const Room = mongoose.model("Room", roomSchema);
export default Room;
