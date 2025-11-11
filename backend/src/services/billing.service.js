import Invoice from "../models/Invoice.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

/**
 * Calculate Invoice totals (internal utility)
 */
export const calculateTotals = (items, tax = 0, discount = 0) => {
  const subTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const taxAmount = (subTotal * tax) / 100;
  const discountAmount = (subTotal * discount) / 100;

  const grandTotal = subTotal + taxAmount - discountAmount;

  return {
    subTotal,
    taxAmount,
    discountAmount,
    grandTotal,
  };
};

/**
 * Create Invoice
 */
export const createInvoiceService = async ({
  patient,
  appointment,
  items,
  tax,
  discount,
  paymentMethod
}) => {
  if (!items || !items.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invoice must contain at least one item");
  }

  const { subTotal, taxAmount, discountAmount, grandTotal } = calculateTotals(items, tax, discount);

  const formattedItems = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));

  const invoice = await Invoice.create({
    patient,
    appointment,
    items: formattedItems,
    tax,
    discount,
    subTotal,
    grandTotal,
    status: "pending",
    paymentMethod: paymentMethod || "cash",
  });

  return invoice;
};

/**
 * Update Invoice
 */
export const updateInvoiceService = async (invoiceId, updateData) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  const { items, tax = invoice.tax, discount = invoice.discount } = updateData;

  if (items && items.length) {
    const { subTotal, grandTotal } = calculateTotals(items, tax, discount);

    updateData.subTotal = subTotal;
    updateData.grandTotal = grandTotal;
    updateData.items = items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
  }

  const updated = await Invoice.findByIdAndUpdate(invoiceId, updateData, { new: true });
  return updated;
};

/**
 * Mark Invoice Paid
 */
export const markInvoicePaid = async (invoiceId, method = "cash") => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  invoice.status = "paid";
  invoice.paymentMethod = method;
  await invoice.save();

  return invoice;
};

/* ✅ Alias so controller import works (`computeTotals`) */
export const computeTotals = calculateTotals;
