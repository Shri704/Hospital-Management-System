import mongoose from "mongoose";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const invoiceSchema = new mongoose.Schema(
  {
    ...baseFields,

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: false,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    department: {
      type: String,
      trim: true,
    },

    patientDetails: {
      name: { type: String, trim: true },
      admissionNumber: { type: String, trim: true },
      contact: { type: String, trim: true },
    },

    hospitalDetails: {
      name: { type: String, trim: true },
      address: { type: String, trim: true },
      contact: { type: String, trim: true },
    },

    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true },
      }
    ],

    tax: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "insurance", "other"],
      default: "cash",
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    balanceDue: {
      type: Number,
      default: 0,
    },

    billingType: {
      type: String,
      enum: ["full", "admission", "discharge"],
      default: "full",
    },

    admissionPayment: {
      type: Number,
      default: 0,
    },

    insuranceDetails: {
      provider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
      coverageAmount: { type: Number, default: 0 },
      coveragePercentage: { type: Number, default: 0 },
    },

    notes: {
      type: String,
      trim: true,
    },

    signatures: {
      billingStaff: { type: String, trim: true },
      patient: { type: String, trim: true },
    },
  },
  baseOptions
);

// Soft delete support
applySoftDelete(invoiceSchema);

// Indexes
invoiceSchema.index({ patient: 1 });
invoiceSchema.index({ appointment: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
