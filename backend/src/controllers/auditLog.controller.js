import httpStatus from "http-status";
import AuditLog from "../models/AuditLog.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc Get all audit logs (filter + pagination)
 * @route GET /api/audit-logs
 * @access Admin only
 */
export const list = asyncHandler(async (req, res) => {
  const { user, action, from, to, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (user) filter.user = user;
  if (action) filter.action = action;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const logs = await AuditLog.find(filter)
    .populate("user", "firstName lastName email role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(filter);

  res.json(
    new ApiResponse({
      data: logs,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    })
  );
});

/**
 * @desc Get one audit log
 * @route GET /api/audit-logs/:id
 * @access Admin only
 */
export const getOne = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id)
    .populate("user", "firstName lastName email role");

  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, "Audit log not found");
  }

  res.json(new ApiResponse({ data: log }));
});
