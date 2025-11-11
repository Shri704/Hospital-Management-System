import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Generate Access Token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

/**
 * Register new user
 */
export const registerUser = async (data) => {
  const { email, password } = data;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists with this email");
  }

  const user = await User.create(data);

  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user, token, refreshToken };
};

/**
 * Login User
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is disabled");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user, token, refreshToken };
};

/**
 * Refresh Access Token
 */
export const refreshTokenService = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    return { token: newAccessToken, refreshToken: newRefreshToken };
  } catch (e) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }
};

/* ✅ Export alias so controllers expecting signToken won't break */
export const signToken = generateAccessToken;
export const signRefreshToken = generateRefreshToken;
