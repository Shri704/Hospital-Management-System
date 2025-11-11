import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "APPROVE",
        "REJECT",
        "SYSTEM"
      ]
    },

    module: {
      type: String,
      required: true,
      enum: [
        "USER",
        "PATIENT",
        "DOCTOR",
        "APPOINTMENT",
        "INVOICE",
        "MEDICINE",
        "MEDICAL_RECORD",
        "AUTH",
        "SYSTEM"
      ]
    },

    description: {
      type: String,
      trim: true,
    },

    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },

    previousData: {
      type: Object,
      default: null,
    },

    newData: {
      type: Object,
      default: null,
    },

    isSystemLog: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes to speed up searching
auditLogSchema.index({ user: 1, module: 1, action: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
