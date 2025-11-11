import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Create User (Admin Only)
 */
export const createUserService = async (data) => {
  const existing = await User.findOne({ email: data.email });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already registered");
  }

  const user = await User.create(data);
  return user;
};

/**
 * List Users (search + pagination)
 */
export const listUsersService = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const query = { isDeleted: false };

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    User.countDocuments(query)
  ]);

  return {
    users,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID
 */
export const getUserByIdService = async (id) => {
  const user = await User.findById(id).select("-password");

  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Update User
 */
export const updateUserService = async (id, data) => {
  if (data.email) {
    const exists = await User.findOne({ email: data.email, _id: { $ne: id } });
    if (exists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
    }
  }

  const user = await User.findByIdAndUpdate(id, data, { new: true }).select("-password");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Soft Delete User
 */
export const deleteUserService = async (id) => {
  const user = await User.softDelete(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Deactivate / Activate User
 */
export const toggleUserStatusService = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};
