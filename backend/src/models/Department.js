import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const departmentSchema = new mongoose.Schema(
  {
    ...baseFields,

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
  },
  baseOptions
);

// Soft delete support
applySoftDelete(departmentSchema);

// Index for faster search
departmentSchema.index({ name: "text" });

const Department = mongoose.model("Department", departmentSchema);
export default Department;
