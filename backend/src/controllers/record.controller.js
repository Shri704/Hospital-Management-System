import MedicalRecord from "../models/MedicalRecord.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import httpStatus from "http-status";

/**
 * @desc Get all medical records (Admin/Doctor)
 * @route GET /api/records
 * @access Private (Doctor/Admin)
 */
export const list = asyncHandler(async (req, res) => {
  const { patient, doctor } = req.query;
  const filter = { isDeleted: false };

  if (patient) filter.patient = patient;
  if (doctor) filter.doctor = doctor;

  const records = await MedicalRecord.find(filter)
    .populate("patient", "firstName lastName phone")
    .populate("doctor", "firstName lastName specialization")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse({ data: records }));
});

/**
 * @desc Get all medical records for a patient
 * @route GET /api/records/patient/:patientId
 * @access Private (Doctor/Admin)
 */
export const listByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const records = await MedicalRecord.find({ patient: patientId, isDeleted: false })
    .populate("doctor", "firstName lastName specialization")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse({ data: records }));
});

/**
 * @desc Create medical record
 * @route POST /api/records
 * @access Private (Doctor/Admin)
 */
export const create = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.create(req.body);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "Medical record added",
      data: record,
    })
  );
});

/**
 * @desc Get a specific medical record by ID
 * @route GET /api/records/:id
 * @access Private (Doctor/Admin)
 */
export const getOne = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate("doctor", "firstName lastName specialization")
    .populate("patient", "firstName lastName");

  if (!record) throw new ApiError(httpStatus.NOT_FOUND, "Record not found");

  res.json(new ApiResponse({ data: record }));
});

/**
 * @desc Update medical record
 * @route PATCH /api/records/:id
 * @access Private (Doctor/Admin)
 */
export const update = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!record) throw new ApiError(httpStatus.NOT_FOUND, "Record not found");

  res.json(
    new ApiResponse({
      message: "Record updated successfully",
      data: record,
    })
  );
});

/**
 * @desc Delete medical record
 * @route DELETE /api/records/:id
 * @access Private (Admin/Doctor)
 */
export const remove = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndDelete(req.params.id);

  if (!record) throw new ApiError(httpStatus.NOT_FOUND, "Record not found");

  res.json(new ApiResponse({ message: "Record deleted successfully" }));
});
