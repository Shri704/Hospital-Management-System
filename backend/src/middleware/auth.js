import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

/**
 * Middleware: Auth guard — verifies JWT and attaches user to request
 */
export const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isDeleted || !user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token or user disabled");
    }

    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token"));
  }
};

