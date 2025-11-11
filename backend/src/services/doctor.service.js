import Doctor from "../models/Doctor.js";
import Department from "../models/Department.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Validate department exists (if provided)
 */
const validateDepartment = async (departmentId) => {
  if (!departmentId) return;
  const dept = await Department.findById(departmentId);
  if (!dept) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Department ID");
};

/**
 * Create a doctor
 */
export const createDoctorService = async (data) => {
  await validateDepartment(data.department);

  const doctorExists = await Doctor.findOne({ email: data.email });
  if (doctorExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Doctor already exists with this email");
  }

  const doctor = await Doctor.create(data);
  return doctor;
};

/**
 * List doctors with search + pagination
 */
export const listDoctorsService = async ({ page = 1, limit = 10, search = "" }) => {
  const query = {
    isDeleted: false,
  };

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    Doctor.find(query)
      .skip(skip)
      .limit(limit)
      .populate("department", "name")
      .sort({ createdAt: -1 }),
    
    Doctor.countDocuments(query)
  ]);

  return {
    doctors,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    }
  };
};

/**
 * Get doctor by ID
 */
export const getDoctorByIdService = async (id) => {
  const doctor = await Doctor.findById(id)
    .populate("department", "name")
    .exec();

  if (!doctor || doctor.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  return doctor;
};

/**
 * Update doctor
 */
export const updateDoctorService = async (id, data) => {
  await validateDepartment(data.department);

  const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true });

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  return doctor;
};

/**
 * Soft delete doctor
 */
export const deleteDoctorService = async (id) => {
  const doctor = await Doctor.softDelete(id);

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  return doctor;
};

/**
 * Update doctor availability
 */
export const updateDoctorAvailabilityService = async (id, availability) => {
  const doctor = await Doctor.findById(id);

  if (!doctor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
  }

  doctor.availability = availability;
  await doctor.save();

  return doctor;
};
