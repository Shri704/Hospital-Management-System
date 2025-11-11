import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const prescriptionSchema = new mongoose.Schema(
  {
    ...baseFields,

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: false,
    },

    medications: [
      {
        medicine: { type: String, required: true, trim: true },
        dosage: { type: String, required: true, trim: true },         // e.g. "500mg"
        frequency: { type: String, required: true, trim: true },      // e.g. "2 times/day"
        duration: { type: String, required: true, trim: true },       // e.g. "5 days"
        instructions: { type: String, trim: true }                    // optional notes
      }
    ],

    notes: {
      type: String,
      trim: true,
    },

    followUpDate: {
      type: Date,
      default: null,
    }
  },
  baseOptions
);

// Soft delete support
applySoftDelete(prescriptionSchema);

// Indexes
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ appointment: 1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
