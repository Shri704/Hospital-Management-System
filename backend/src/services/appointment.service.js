import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Validate if patient & doctor exist before appointment creating
 */
export const validateAppointmentData = async (patientId, doctorId) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid patient ID");

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid doctor ID");

  return { patient, doctor };
};

/**
 * Create appointment service
 */
export const createAppointment = async ({
  patient,
  doctor,
  date,
  timeSlot,
  reason,
}) => {
  await validateAppointmentData(patient, doctor);

  const appointmentExists = await Appointment.findOne({
    doctor,
    date,
    timeSlot,
    isDeleted: false,
  });

  if (appointmentExists) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Time slot already booked for this doctor"
    );
  }

  const newAppointment = await Appointment.create({
    patient,
    doctor,
    date,
    timeSlot,
    reason,
  });

  return newAppointment;
};

/**
 * Update appointment status logic
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment)
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");

  appointment.status = status;
  await appointment.save();

  return appointment;
};

/**
 * Get appointments by doctor
 */
export const getAppointmentsByDoctor = async (doctorId, date = null) => {
  const filter = { doctor: doctorId, isDeleted: false };
  if (date) filter.date = date;

  const appointments = await Appointment.find(filter)
    .populate("patient", "firstName lastName phone")
    .sort({ date: 1 });

  return appointments;
};

/**
 * Get appointments by patient
 */
export const getAppointmentsByPatient = async (patientId) => {
  return Appointment.find({ patient: patientId, isDeleted: false })
    .populate("doctor", "firstName lastName specialization")
    .sort({ date: -1 });
};
