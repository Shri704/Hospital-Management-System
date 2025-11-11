import httpStatus from "http-status";
import Medicine from "../models/Medicine.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc Get all medicines (with search & low stock filter)
 * @route GET /api/medicines
 * @access Private (Pharmacist/Admin)
 */
export const list = asyncHandler(async (req, res) => {
  const { q, lowStock } = req.query;
  const filter = {};

  if (q) filter.name = new RegExp(q, "i");
  if (lowStock) filter.stock = { $lte: Number(lowStock) };

  const medicines = await Medicine.find(filter).sort({ stock: 1, name: 1 });

  res.json(new ApiResponse({ data: medicines }));
});

/**
 * @desc Create new medicine
 * @route POST /api/medicines
 * @access Pharmacist/Admin
 */
export const create = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "Medicine added successfully",
      data: medicine,
    })
  );
});

/**
 * @desc Get single medicine
 * @route GET /api/medicines/:id
 * @access Private
 */
export const getOne = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) throw new ApiError(httpStatus.NOT_FOUND, "Medicine not found");

  res.json(new ApiResponse({ data: medicine }));
});

/**
 * @desc Update medicine details
 * @route PATCH /api/medicines/:id
 * @access Pharmacist/Admin
 */
export const update = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!medicine) throw new ApiError(httpStatus.NOT_FOUND, "Medicine not found");

  res.json(
    new ApiResponse({
      message: "Medicine updated successfully",
      data: medicine,
    })
  );
});

/**
 * @desc Adjust stock (increase or decrease)
 * @route PATCH /api/medicines/:id/stock
 * @access Pharmacist/Admin
 */
export const adjustStock = asyncHandler(async (req, res) => {
  const { delta } = req.body; // +5 or -5

  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    { $inc: { stock: delta } },
    { new: true }
  );

  if (!medicine) throw new ApiError(httpStatus.NOT_FOUND, "Medicine not found");

  res.json(
    new ApiResponse({
      message: "Medicine stock updated",
      data: medicine,
    })
  );
});

/**
 * @desc Delete medicine
 * @route DELETE /api/medicines/:id
 * @access Admin
 */
export const remove = asyncHandler(async (req, res) => {
  const deleted = await Medicine.findByIdAndDelete(req.params.id);

  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, "Medicine not found");

  res.json(new ApiResponse({ message: "Medicine deleted successfully" }));
});
