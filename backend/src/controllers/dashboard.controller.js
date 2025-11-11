import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import httpStatus from "http-status";

/**
 * @desc Dashboard total stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [patients, doctors, appointments, pendingInvoices] =
    await Promise.all([
      Patient.countDocuments({ isDeleted: false }),
      Doctor.countDocuments({ isDeleted: false }),
      Appointment.countDocuments({ isDeleted: false }),
      Invoice.countDocuments({ status: "pending", isDeleted: false }),
    ]);

  res.json(
    new ApiResponse({
      message: "Dashboard statistics",
      data: {
        totalPatients: patients,
        totalDoctors: doctors,
        totalAppointments: appointments,
        pendingInvoices,
      },
    })
  );
});

/**
 * @desc Recent Appointments
 */
export const getRecentAppointments = asyncHandler(async (req, res) => {
  const recent = await Appointment.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("patient", "firstName lastName")
    .populate("doctor", "firstName lastName specialization");

  res.json(
    new ApiResponse({
      message: "Recent appointments",
      data: recent,
    })
  );
});

/**
 * @desc Recent Patients
 */
export const getRecentPatients = asyncHandler(async (req, res) => {
  const recent = await Patient.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName lastName age phone createdAt");

  res.json(
    new ApiResponse({
      message: "Recent patients",
      data: recent,
    })
  );
});

/**
 * @desc Revenue summary (monthly for last 12 months)
 */
export const getRevenueSummary = asyncHandler(async (req, res) => {
  const summary = await Invoice.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: "$grandTotal" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  res.json(
    new ApiResponse({
      message: "Revenue summary",
      data: summary,
    })
  );
});
