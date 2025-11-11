import Medicine from "../models/Medicine.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Check & deduct medicine stock before dispensing
 */
export const dispenseMedicineService = async (items = []) => {
  if (!items.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No medicines provided");
  }

  // Validate each medicine stock
  for (const item of items) {
    const med = await Medicine.findById(item.medicineId);
    if (!med || med.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, `Medicine not found: ${item.medicineId}`);
    }

    if (med.stock < item.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for ${med.name}. Available: ${med.stock}`
      );
    }
  }

  // Deduct stock once all checks passed ✅
  const updatedMedicines = [];
  for (const item of items) {
    const med = await Medicine.findById(item.medicineId);
    med.stock -= item.quantity;
    await med.save();
    updatedMedicines.push(med);
  }

  return { message: "Medicines dispensed", updatedMedicines };
};

/**
 * Return medicine back to stock
 */
export const returnMedicinesService = async (items = []) => {
  if (!items.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No medicines to return");
  }

  const updatedMedicines = [];
  for (const item of items) {
    const med = await Medicine.findById(item.medicineId);

    if (!med) {
      throw new ApiError(httpStatus.NOT_FOUND, `Medicine not found: ${item.medicineId}`);
    }

    med.stock += item.quantity;
    await med.save();
    updatedMedicines.push(med);
  }

  return { message: "Medicines returned to stock", updatedMedicines };
};

/**
 * Get low stock medicines
 */
export const lowStockService = async (threshold = 10) => {
  const medicines = await Medicine.find({
    stock: { $lte: threshold },
    isDeleted: false,
  }).sort({ stock: 1 });

  return medicines;
};

/**
 * Search medicine by name/category
 */
export const searchMedicineService = async (search = "") => {
  if (!search) {
    return await Medicine.find({ isDeleted: false }).sort({ name: 1 });
  }

  return await Medicine.find({
    isDeleted: false,
    $text: { $search: search },
  }).sort({ name: 1 });
};

/**
 * Get expiring medicines soon
 */
export const expiringSoonService = async (days = 30) => {
  const target = new Date();
  target.setDate(target.getDate() + days);

  return await Medicine.find({
    expiryDate: { $lte: target },
    isDeleted: false,
  }).sort({ expiryDate: 1 });
};
