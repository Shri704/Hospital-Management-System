import {
  registerUser,
  loginUser,
  refreshTokenService,
  generateAccessToken,
  generateRefreshToken
} from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @route POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { user, token, refreshToken } = await registerUser(req.body);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      message: "User registered successfully",
      data: { user, token, refreshToken },
    })
  );
});

/**
 * @route POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { user, token, refreshToken } = await loginUser(req.body);

  res.json(
    new ApiResponse({
      message: "Login successful",
      data: { user, token, refreshToken },
    })
  );
});

/**
 * @route POST /api/auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Refresh token is required");
  }

  const tokens = await refreshTokenService(refreshToken);

  res.json(
    new ApiResponse({
      message: "Token refreshed successfully",
      data: tokens,
    })
  );
});

/**
 * @route POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // In stateless JWT logout, we simply instruct client to delete token
  res.json(new ApiResponse({ message: "Logged out successfully" }));
});

/**
 * @route GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  res.json(
    new ApiResponse({
      message: "User profile fetched",
      data: req.user,
    })
  );
});
