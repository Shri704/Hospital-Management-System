import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const medicalRecordSchema = new mongoose.Schema(
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

    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    secondaryDiagnosis: {
      type: String,
      trim: true,
    },

    medicalHistory: {
      type: String,
      trim: true,
    },

    familyHistory: {
      type: String,
      trim: true,
    },

    symptoms: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    vitals: {
      bloodPressure: { type: String, trim: true },
      pulse: { type: String, trim: true },
      temperature: { type: String, trim: true },
      respirationRate: { type: String, trim: true },
      spo2: { type: String, trim: true },
      weight: { type: String, trim: true },
    },

    medications: [
      {
        name: { type: String, required: true, trim: true },
        dosage: { type: String, required: true, trim: true },
        duration: { type: String, required: true, trim: true }, // e.g. "5 days"
      }
    ],

    treatmentPlan: {
      type: String,
      trim: true,
    },

    tests: [
      {
        name: { type: String, required: true, trim: true },
        result: { type: String, trim: true },
        date: { type: Date },
      }
    ],

    surgeryDetails: [
      {
        name: { type: String, trim: true },
        date: { type: Date },
        outcome: { type: String, trim: true },
        notes: { type: String, trim: true },
      }
    ],

    progressNotes: {
      type: String,
      trim: true,
    },

    doctorNotes: {
      type: String,
      trim: true,
    },

    nursingNotes: {
      type: String,
      trim: true,
    },

    dischargeSummary: {
      type: String,
      trim: true,
    },

    followUpInstructions: {
      type: String,
      trim: true,
    },

    documents: [
      {
        title: { type: String, trim: true },
        type: { type: String, trim: true },
        url: { type: String, trim: true },
        notes: { type: String, trim: true },
      }
    ],

    consentForms: [
      {
        type: { type: String, trim: true },
        signedBy: { type: String, trim: true },
        relation: { type: String, trim: true },
        date: { type: Date },
        notes: { type: String, trim: true },
      }
    ],

    followUpDate: {
      type: Date,
      required: false,
    },
  },
  baseOptions
);

// Soft delete support
applySoftDelete(medicalRecordSchema);

// Indexes for performance
medicalRecordSchema.index({ patient: 1 });
medicalRecordSchema.index({ doctor: 1 });
medicalRecordSchema.index({ diagnosis: "text", symptoms: "text" });

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
