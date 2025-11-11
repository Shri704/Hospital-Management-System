import httpStatus from "http-status";
import Doctor from "../models/Doctor.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc Get all doctors (search + filter)
 * @route GET /api/doctors
 * @access Private (Admin/Receptionist/Doctor)
 */
export const list = asyncHandler(async (req, res) => {
  const { specialization, q } = req.query;
  const filter = { isDeleted: false };

  if (specialization) {
    filter.specialization = specialization;
  }

  if (q) {
    filter.$or = [
      { firstName: new RegExp(q, "i") },
      { lastName: new RegExp(q, "i") },
    ];
  }

  const doctors = await Doctor.find(filter).populate("department");

  res.json(new ApiResponse({ data: doctors }));
});

/**
 * @desc Public: minimal list of doctors (id, name, specialization)
 * @route GET /api/doctors/public
 * @access Public
 */
export const listPublic = asyncHandler(async (_req, res) => {
  const doctors = await Doctor.find({ isDeleted: false })
    .select("firstName lastName specialization")
    .sort({ firstName: 1, lastName: 1 });

  res.json(new ApiResponse({ data: doctors }));
});

/**
 * @desc Create doctor profile
 * @route POST /api/doctors
 * @access Admin only
 */
export const create = asyncHandler(async (req, res) => {
  // Clean up the request body - convert empty strings to null/undefined for ObjectId fields
  const body = { ...req.body };
  
  // If department is an empty string, remove it or set to null
  if (body.department === '' || body.department === null) {
    delete body.department;
  }
  
  const doctor = await Doctor.create(body);
  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "Doctor created successfully",
      data: doctor,
    })
  );
});

/**
 * @desc Get doctor by ID
 * @route GET /api/doctors/:id
 * @access Private
 */
export const getOne = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("department");

  if (!doctor || doctor.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");

  res.json(new ApiResponse({ data: doctor }));
});

/**
 * @desc Update doctor
 * @route PATCH /api/doctors/:id
 * @access Admin only
 */
export const update = asyncHandler(async (req, res) => {
  // Clean up the request body - convert empty strings to null/undefined for ObjectId fields
  const body = { ...req.body };
  
  // If department is an empty string, remove it or set to null
  if (body.department === '' || body.department === null) {
    delete body.department;
  }
  
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, body, {
    new: true,
  });

  if (!doctor) throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");

  res.json(
    new ApiResponse({
      message: "Doctor updated successfully",
      data: doctor,
    })
  );
});

/**
 * @desc Delete doctor (hard delete)
 * @route DELETE /api/doctors/:id
 * @access Admin only
 */
export const remove = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");

  res.json(new ApiResponse({ message: "Doctor deleted successfully" }));
});
