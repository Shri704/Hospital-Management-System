import httpStatus from "http-status";
import Patient from "../models/Patient.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc Get all patients (with pagination & search)
 * @route GET /api/patients
 * @access Private (Admin/Doctor/Receptionist)
 */
export const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, q } = req.query;

  const filter = { isDeleted: false };

  if (q) {
    filter.$text = { $search: q };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [patients, total] = await Promise.all([
    Patient.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Patient.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse({
      data: patients,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  );
});

/**
 * @desc Create patient
 * @route POST /api/patients
 * @access Private (Admin/Doctor/Receptionist)
 */
export const create = asyncHandler(async (req, res) => {
  const patient = await Patient.create(req.body);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "Patient created successfully",
      data: patient,
    })
  );
});

/**
 * @desc Get single patient
 * @route GET /api/patients/:id
 * @access Private
 */
export const getOne = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient || patient.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");

  res.json(new ApiResponse({ data: patient }));
});

/**
 * @desc Update patient
 * @route PATCH /api/patients/:id
 * @access Private (Admin/Doctor/Receptionist)
 */
export const update = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");

  res.json(
    new ApiResponse({
      message: "Patient updated successfully",
      data: patient,
    })
  );
});

/**
 * @desc Delete patient (hard delete)
 * @route DELETE /api/patients/:id
 * @access Admin only
 */
export const remove = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);

  if (!patient) throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");

  res.json(new ApiResponse({ message: "Patient deleted successfully" }));
});
