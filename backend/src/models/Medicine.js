import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const medicineSchema = new mongoose.Schema(
  {
    ...baseFields,

    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: false,
      trim: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "tablet", // tablet, syrup, capsule, injection etc.
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiryDate: {
      type: Date,
      required: false,
    }
  },
  baseOptions
);

// Soft delete support
applySoftDelete(medicineSchema);

// Index for search
medicineSchema.index({ name: "text", category: "text" });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
