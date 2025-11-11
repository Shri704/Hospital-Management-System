import httpStatus from "http-status";
import Prescription from "../models/Prescription.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc Get all prescriptions (filter optional by patient/doctor)
 * @route GET /api/prescriptions
 */
export const list = asyncHandler(async (req, res) => {
  const { patient, doctor } = req.query;

  const filter = { isDeleted: false };
  if (patient) filter.patient = patient;
  if (doctor) filter.doctor = doctor;

  const prescriptions = await Prescription.find(filter)
    .populate("patient", "firstName lastName phone")
    .populate("doctor", "firstName lastName specialization")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse({ data: prescriptions }));
});

/**
 * @desc Create Prescription
 * @route POST /api/prescriptions
 */
export const create = asyncHandler(async (req, res) => {
  const data = req.body;

  const prescription = await Prescription.create(data);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: httpStatus.CREATED,
      message: "Prescription created successfully",
      data: prescription,
    })
  );
});

/**
 * @desc Get single prescription
 * @route GET /api/prescriptions/:id
 */
export const getOne = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate("patient", "firstName lastName phone")
    .populate("doctor", "firstName lastName specialization");

  if (!prescription || prescription.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Prescription not found");
  }

  res.json(new ApiResponse({ data: prescription }));
});

/**
 * @desc Update prescription
 * @route PATCH /api/prescriptions/:id
 */
export const update = asyncHandler(async (req, res) => {
  const updated = await Prescription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    throw new ApiError(httpStatus.NOT_FOUND, "Prescription not found");
  }

  res.json(
    new ApiResponse({
      message: "Prescription updated successfully",
      data: updated,
    })
  );
});

/**
 * @desc Delete prescription (soft delete)
 * @route DELETE /api/prescriptions/:id
 */
export const remove = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    throw new ApiError(httpStatus.NOT_FOUND, "Prescription not found");
  }

  prescription.isDeleted = true;
  await prescription.save();

  res.json(new ApiResponse({ message: "Prescription removed" }));
});
