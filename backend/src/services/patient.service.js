import Patient from "../models/Patient.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Validate Patient ID exists
 */
export const validatePatient = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient || patient.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};

/**
 * Create new patient
 */
export const createPatientService = async (data) => {
  // Check duplicate phone (optional)
  const existing = await Patient.findOne({ phone: data.phone, isDeleted: false });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Patient already registered with this phone");
  }

  const patient = await Patient.create(data);
  return patient;
};

/**
 * List Patients with search & pagination
 */
export const listPatientsService = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const query = { isDeleted: false };

  if (search) {
    query.$text = { $search: search }; // Matches name/email/phone via index
  }

  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    Patient.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Patient.countDocuments(query),
  ]);

  return {
    patients,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get Patient by ID
 */
export const getPatientByIdService = async (id) => {
  const patient = await Patient.findById(id);
  if (!patient || patient.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};

/**
 * Update Patient
 */
export const updatePatientService = async (id, data) => {
  const patient = await Patient.findByIdAndUpdate(id, data, { new: true });
  if (!patient || patient.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};

/**
 * Soft Delete Patient
 */
export const deletePatientService = async (id) => {
  const patient = await Patient.softDelete(id);
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};
