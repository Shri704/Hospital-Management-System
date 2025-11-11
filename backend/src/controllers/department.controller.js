import httpStatus from "http-status";
import Department from "../models/Department.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc List departments with optional search
 * @route GET /api/departments
 * @access Private (Admin/Doctor/Receptionist)
 */
export const list = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = { isDeleted: false };

  if (q) {
    filter.name = new RegExp(q, "i");
  }

  const departments = await Department.find(filter)
    .populate("head", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse({ data: departments }));
});

/**
 * @desc Create a new department
 * @route POST /api/departments
 * @access Private (Admin)
 */
export const create = asyncHandler(async (req, res) => {
  // ✅ Fix head field if empty
  if (req.body.head === "") req.body.head = null;

  const department = await Department.create(req.body);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: httpStatus.CREATED,
      message: "Department created successfully",
      data: department,
    })
  );
});

/**
 * @desc Get single department
 * @route GET /api/departments/:id
 * @access Private (Admin/Doctor/Receptionist)
 */
export const getOne = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate("head", "firstName lastName email");

  if (!department || department.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  res.json(new ApiResponse({ data: department }));
});

/**
 * @desc Update department
 * @route PATCH /api/departments/:id
 * @access Private (Admin)
 */
export const update = asyncHandler(async (req, res) => {
  // ✅ Fix head field if empty
  if (req.body.head === "") req.body.head = null;

  const department = await Department.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!department || department.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  res.json(
    new ApiResponse({
      message: "Department updated successfully",
      data: department,
    })
  );
});

/**
 * @desc Soft delete department
 * @route DELETE /api/departments/:id
 * @access Private (Admin)
 */
export const remove = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  res.json(new ApiResponse({ message: "Department removed successfully" }));
});
