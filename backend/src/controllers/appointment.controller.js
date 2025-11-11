import httpStatus from 'http-status';
import Appointment from '../models/Appointment.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Patient from '../models/Patient.js';

// 📌 Get all appointments (filter by date or status)
export const list = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const filter = { isDeleted: false };

  if (from || to) {
    filter.date = {
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  }

  if (status) filter.status = status;

  const items = await Appointment.find(filter)
    .populate('patient doctor')
    .sort({ date: -1 });

  res.json(new ApiResponse({ data: items }));
});

// 📌 Create appointment
export const create = asyncHandler(async (req, res) => {
  const appt = await Appointment.create(req.body);
  await appt.populate('patient doctor');
  res
    .status(httpStatus.CREATED)
    .json(new ApiResponse({ statusCode: 201, message: 'Appointment created', data: appt }));
});

// 📌 Public booking (create patient if needed)
export const publicBook = asyncHandler(async (req, res) => {
  const { patientId, patientInfo = {}, doctor, date, timeSlot, reason } = req.body;

  let patientRefId = patientId;

  if (!patientRefId) {
    const { firstName, lastName, phone, email, gender = 'other' } = patientInfo;
    if (!firstName || !lastName || !phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing patient info (firstName, lastName, phone)');
    }

    const existing = await Patient.findOne({ phone, isDeleted: false });
    const patient = existing || await Patient.create({ firstName, lastName, phone, email, gender });
    patientRefId = patient._id.toString();
  }

  const appt = await Appointment.create({ patient: patientRefId, doctor, date, timeSlot, reason, status: 'pending' });
  await appt.populate('patient doctor');

  res.status(httpStatus.CREATED).json(new ApiResponse({ statusCode: 201, message: 'Appointment request received', data: appt }));
});

// 📌 Get appointment by ID
export const getOne = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne({ _id: req.params.id, isDeleted: false })
    .populate('patient doctor');
  
  if (!appt) throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  
  res.json(new ApiResponse({ data: appt }));
});

// 📌 Update appointment details
export const update = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true }
  );
  
  if (!appt) throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  
  await appt.populate('patient doctor');
  
  res.json(new ApiResponse({ message: 'Appointment updated', data: appt }));
});

// 📌 Update appointment status
export const updateStatus = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne({ _id: req.params.id, isDeleted: false });
  if (!appt) throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');

  appt.status = req.body.status;
  await appt.save();
  await appt.populate('patient doctor');

  res.json(new ApiResponse({ message: 'Status updated', data: appt }));
});

// 📌 Delete appointment (soft delete)
export const remove = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne({ _id: req.params.id, isDeleted: false });
  if (!appt) throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');

  appt.isDeleted = true;
  await appt.save();

  res.json(new ApiResponse({ message: 'Appointment deleted' }));
});
