import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const patientSchema = new mongoose.Schema(
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
      required: false,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: false,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
    },

    emergencyContact: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    medicalHistory: {
      type: String,
      trim: true,
    },

    insuranceProvider: {
      type: String,
      trim: true,
    },

    insuranceNumber: {
      type: String,
      trim: true,
    }
  },
  baseOptions
);

// Soft delete functionality
applySoftDelete(patientSchema);

// Search index
patientSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phone: "text",
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
