import { Router } from "express";

// Auth Routes
import authRoutes from "./auth.routes.js";

// Dashboard
import dashboardRoutes from "./dashboard.routes.js";

// Modules
import patientRoutes from "./patients.routes.js";
import doctorRoutes from "./doctors.routes.js";
import appointmentRoutes from "./appointments.routes.js";
import invoiceRoutes from "./invoices.routes.js";
import medicineRoutes from "./medicines.routes.js";
import roomRoutes from "./rooms.routes.js";
import prescriptionRoutes from "./prescriptions.routes.js";
import notificationRoutes from "./notifications.routes.js";
import auditLogRoutes from "./auditLog.routes.js";
import userRoutes from "./users.routes.js"; // For managing users (admin only)
import departmentRoutes from "./departments.routes.js";
import recordRoutes from "./records.routes.js";

const router = Router();

// Default API health check
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Management API is running ✅",
  });
});

// Auth
router.use("/auth", authRoutes);

// Dashboard
router.use("/dashboard", dashboardRoutes);

// Core Modules
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/medicine", medicineRoutes);
router.use("/rooms", roomRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit-log", auditLogRoutes);
router.use("/users", userRoutes); // user management (admins)
router.use("/departments", departmentRoutes);
router.use("/records", recordRoutes);

export default router;
