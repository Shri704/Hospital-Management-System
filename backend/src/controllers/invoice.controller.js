import httpStatus from "http-status";
import Invoice from "../models/Invoice.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeTotals } from "../services/billing.service.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  const year = new Date().getFullYear();
  return `INV-${year}-${sequence}`;
};

/**
 * @desc Create Invoice
 * @route POST /api/invoices
 * @access Admin / Accountant
 */
export const create = asyncHandler(async (req, res) => {
  const {
    items = [],
    tax = 0,
    discount = 0,
    patient: patientId,
    doctor: doctorId,
    invoiceNumber,
    amountPaid = 0,
    patientDetails = {},
    hospitalDetails = {},
    insuranceDetails = {},
    signatures = {},
    department,
  } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Patient not found");
  }

  const doctor = await Doctor.findById(doctorId).populate("department");
  if (!doctor) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Doctor not found");
  }

  const totals = computeTotals(items, tax, discount);
  const resolvedInvoiceNumber = invoiceNumber?.trim() || (await generateInvoiceNumber());
  const resolvedDepartment =
    department ||
    doctor?.department?.name ||
    doctor?.department?._id ||
    doctor?.specialization ||
    "General";

  const formattedItems = items.map((item) => ({
    ...item,
    total:
      item.total ?? Number(item.total ?? item.quantity * item.unitPrice),
  }));

  const patientSnapshot = {
    name:
      patientDetails.name ||
      `${patient.firstName} ${patient.lastName}`.trim(),
    admissionNumber: patientDetails.admissionNumber || "",
    contact: patientDetails.contact || patient.phone || "",
  };

  const invoice = await Invoice.create({
    ...req.body,
    invoiceNumber: resolvedInvoiceNumber,
    doctor: doctorId,
    department: resolvedDepartment,
    patientDetails: patientSnapshot,
    hospitalDetails: {
      name: hospitalDetails.name || "",
      address: hospitalDetails.address || "",
      contact: hospitalDetails.contact || "",
    },
    insuranceDetails: {
      provider: insuranceDetails.provider || "",
      policyNumber: insuranceDetails.policyNumber || "",
      coverageAmount: insuranceDetails.coverageAmount || 0,
      coveragePercentage: insuranceDetails.coveragePercentage || 0,
    },
    signatures: {
      billingStaff: signatures.billingStaff || "",
      patient: signatures.patient || "",
    },
    items: formattedItems,
    ...totals,
    amountPaid,
    balanceDue: Math.max(totals.grandTotal - Number(amountPaid || 0), 0),
  });

  res.status(httpStatus.CREATED).json(
    new ApiResponse({
      statusCode: 201,
      message: "Invoice created successfully",
      data: invoice,
    })
  );
});

/**
 * @desc Get All Invoices
 * @route GET /api/invoices
 * @access Private (Admin/Accountant/Receptionist)
 */
export const list = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find()
    .populate("patient appointment doctor")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse({ data: invoices }));
});

/**
 * @desc Get Invoice by ID
 * @route GET /api/invoices/:id
 * @access Private (Admin/Accountant/Receptionist)
 */
export const getOne = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate(
    "patient appointment doctor"
  );

  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");

  res.json(new ApiResponse({ data: invoice }));
});

/**
 * @desc Update Invoice
 * @route PATCH /api/invoices/:id
 * @access Admin / Accountant
 */
export const update = asyncHandler(async (req, res) => {
  const {
    items,
    tax,
    discount,
    amountPaid,
    doctor: doctorId,
    patientDetails,
    hospitalDetails,
    insuranceDetails,
    signatures,
    department,
    ...otherFields
  } = req.body;

  let updateData = { ...otherFields };

  if (doctorId) {
    const doctor = await Doctor.findById(doctorId).populate("department");
    if (!doctor) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Doctor not found");
    }
    updateData.doctor = doctorId;
    updateData.department =
      department ||
      doctor?.department?.name ||
      doctor?.department?._id ||
      doctor?.specialization ||
      "General";
  } else if (department) {
    updateData.department = department;
  }

  if (patientDetails) {
    updateData.patientDetails = {
      name: patientDetails.name,
      admissionNumber: patientDetails.admissionNumber,
      contact: patientDetails.contact,
    };
  }

  if (hospitalDetails) {
    updateData.hospitalDetails = {
      name: hospitalDetails.name,
      address: hospitalDetails.address,
      contact: hospitalDetails.contact,
    };
  }

  if (insuranceDetails) {
    updateData.insuranceDetails = {
      provider: insuranceDetails.provider,
      policyNumber: insuranceDetails.policyNumber,
      coverageAmount: insuranceDetails.coverageAmount,
      coveragePercentage: insuranceDetails.coveragePercentage,
    };
  }

  if (signatures) {
    updateData.signatures = {
      billingStaff: signatures.billingStaff,
      patient: signatures.patient,
    };
  }

  if (items || tax !== undefined || discount !== undefined) {
    const safeItems = (items || []).map((item) => ({
      ...item,
      total:
        item.total ?? Number(item.total ?? item.quantity * item.unitPrice),
    }));
    const totals = computeTotals(
      safeItems,
      tax ?? updateData.tax ?? 0,
      discount ?? updateData.discount ?? 0
    );
    updateData.items = safeItems.length ? safeItems : undefined;
    updateData.tax = tax ?? updateData.tax;
    updateData.discount = discount ?? updateData.discount;
    updateData.subTotal = totals.subTotal;
    updateData.taxAmount = totals.taxAmount;
    updateData.discountAmount = totals.discountAmount;
    updateData.grandTotal = totals.grandTotal;
  }

  if (amountPaid !== undefined) {
    updateData.amountPaid = Number(amountPaid);
  }

  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate("patient appointment doctor");

  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");

  if (amountPaid !== undefined || updateData.grandTotal !== undefined) {
    invoice.balanceDue = Math.max(
      (updateData.grandTotal ?? invoice.grandTotal) -
        Number(amountPaid ?? invoice.amountPaid ?? 0),
      0
    );
    await invoice.save();
  }

  res.json(
    new ApiResponse({
      message: "Invoice updated successfully",
      data: invoice,
    })
  );
});

/**
 * @desc Mark Invoice Paid
 * @route PATCH /api/invoices/:id/pay
 * @access Admin / Accountant
 */
export const markPaid = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { status: "paid", amountPaid: 0 },
    { new: true }
  );

  if (!invoice) throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");

  invoice.amountPaid = invoice.grandTotal;
  invoice.balanceDue = 0;
  await invoice.save();

  res.json(
    new ApiResponse({
      message: "Invoice marked as paid",
      data: invoice,
    })
  );
});

/**
 * @desc Delete Invoice
 * @route DELETE /api/invoices/:id
 * @access Admin only
 */
export const remove = asyncHandler(async (req, res) => {
  const deleted = await Invoice.findByIdAndDelete(req.params.id);

  if (!deleted) throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");

  res.json(new ApiResponse({ message: "Invoice deleted successfully" }));
});
