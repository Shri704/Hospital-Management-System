import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const doctorSchema = new mongoose.Schema(
  {
    ...baseFields,

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: false,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    consultationFee: {
      type: Number,
      default: 500,
    },

    availability: [
      {
        day: { type: String }, // Monday, Tuesday, etc
        startTime: { type: String }, // 10:00 AM
        endTime: { type: String }, // 04:00 PM
      }
    ],

    bio: {
      type: String,
      trim: true,
    },
  },
  baseOptions
);

// Soft delete support
applySoftDelete(doctorSchema);

// Search indexing
doctorSchema.index({
  firstName: "text",
  lastName: "text",
  specialization: "text",
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
