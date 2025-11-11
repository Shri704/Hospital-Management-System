import httpStatus from "http-status";
import Room from "../models/Room.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * List rooms
 */
export const list = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ isDeleted: false }).sort({ createdAt: -1 });
  res.json(new ApiResponse({ data: rooms }));
});

/**
 * Create room
 */
export const create = asyncHandler(async (req, res) => {
  const { roomNumber, type } = req.body;

  const exists = await Room.findOne({ roomNumber, isDeleted: false });

  if (exists) throw new ApiError(httpStatus.BAD_REQUEST, "Room number already exists");

  const room = await Room.create(req.body);

  res
    .status(httpStatus.CREATED)
    .json(new ApiResponse({ message: "Room created", data: room }));
});

/**
 * Get room by ID
 */
export const getOne = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room || room.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");

  res.json(new ApiResponse({ data: room }));
});

/**
 * Update room
 */
export const update = asyncHandler(async (req, res) => {
  const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!updated)
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");

  res.json(new ApiResponse({ message: "Room updated", data: updated }));
});

/**
 * Soft delete room
 */
export const remove = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room)
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");

  room.isDeleted = true;
  await room.save();

  res.json(new ApiResponse({ message: "Room deleted" }));
});
