import httpStatus from "http-status";
import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

/**
 * @desc Get all users (Admin only)
 * @route GET /api/users
 * @access Admin
 */
export const list = asyncHandler(async (req, res) => {
  const { role, q } = req.query;

  const filter = { isDeleted: false };

  if (role) filter.role = role;
  if (q) filter.name = new RegExp(q, "i");

  const users = await User.find(filter).sort({ createdAt: -1 }).select("-password");

  res.json(new ApiResponse({ data: users }));
});

/**
 * @desc Create a user (Admin panel add staff)
 * @route POST /api/users
 * @access Admin
 */
export const create = asyncHandler(async (req, res) => {
  const { password, ...userData } = req.body;

  // Hash password if provided
  if (password) {
    userData.password = await bcrypt.hash(password, 10);
  }

  const user = await User.create(userData);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "User created successfully",
      data: { ...user.toObject(), password: undefined },
    })
  );
});

/**
 * @desc Get a single user
 * @route GET /api/users/:id
 * @access Admin
 */
export const getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user || user.isDeleted) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  res.json(new ApiResponse({ data: user }));
});

/**
 * @desc Update user info
 * @route PATCH /api/users/:id
 * @access Admin
 */
export const update = asyncHandler(async (req, res) => {
  // Prevent password update here
  if (req.body.password) delete req.body.password;

  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  res.json(
    new ApiResponse({
      message: "User updated successfully",
      data: user,
    })
  );
});

/**
 * @desc Delete user (hard delete)
 * @route DELETE /api/users/:id
 * @access Admin
 */
export const remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  res.json(new ApiResponse({ message: "User deleted successfully" }));
});
