import { useEffect, useMemo, useState } from 'react';
import {
  FiFileText,
  FiHash,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMail,
  FiPrinter,
  FiCheckCircle,
  FiDollarSign,
  FiDownload,
} from 'react-icons/fi';
import { invoiceService } from '../services/invoiceService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const chargeCatalog = [
  { key: 'consultation', label: 'Consultation Charges', description: 'Doctor visits & consultation fees.' },
  { key: 'room', label: 'Room / Bed Charges', description: 'Ward, ICU stay, per day charges.' },
  { key: 'nursing', label: 'Nursing Charges', description: 'Nursing services and care.' },
  { key: 'procedure', label: 'Operation / Procedure Charges', description: 'Surgery, anesthesia, OT charges.' },
  { key: 'lab', label: 'Lab Test Charges', description: 'Blood tests, X-ray, MRI, CT scan etc.' },
  { key: 'pharmacy', label: 'Pharmacy / Medicine Cost', description: 'Medicines and injections issued.' },
  { key: 'equipment', label: 'Equipment Charges', description: 'ICU devices, ventilator use.' },
  { key: 'consumables', label: 'Consumables', description: 'Syringes, gloves, disposables, kits.' },
  { key: 'emergency', label: 'Emergency / ICU Fees', description: 'Emergency and critical care charges.' },
  { key: 'misc', label: 'Miscellaneous Charges', description: 'Ambulance, food, other misc. costs.' },
];

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const Invoices = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    hospitalName: 'CityCare Hospital',
    hospitalContact: '',
    hospitalAddress: '',
    patientAdmissionNumber: '',
    patientContact: '',
    tax: 5,
    discount: 0,
    amountPaid: 0,
    paymentMethod: 'cash',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceCoverageAmount: 0,
    insuranceCoveragePercentage: 0,
    billingStaffName: '',
    patientSignatureName: '',
    notes: '',
    billingType: 'full', // 'admission', 'discharge', or 'full'
    admissionPayment: 0, // Partial payment before admission
  });

  const [chargeValues, setChargeValues] = useState(() =>
    chargeCatalog.reduce((acc, charge) => ({ ...acc, [charge.key]: 0 }), {})
  );

  const fetchDependencies = async () => {
    setLoading(true);
    try {
      const [patientRes, doctorRes, invoiceRes] = await Promise.all([
        patientService.getAll(),
        doctorService.getAll(),
        invoiceService.getAll(),
      ]);

      setPatients(patientRes?.data || patientRes || []);
      setDoctors(doctorRes?.data || doctorRes || []);
      setInvoices(invoiceRes?.data || invoiceRes || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
      setError(err.response?.data?.message || 'Unable to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === form.patient),
    [patients, form.patient]
  );

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === form.doctor),
    [doctors, form.doctor]
  );

  useEffect(() => {
    if (selectedPatient) {
      setForm((prev) => ({
        ...prev,
        patientContact: selectedPatient.phone || '',
      }));
    }
  }, [selectedPatient]);

  const chargeItems = useMemo(() => {
    return chargeCatalog
      .map((charge) => ({
        category: charge,
        amount: Number(chargeValues[charge.key]) || 0,
      }))
      .filter((item) => item.amount > 0);
  }, [chargeValues]);

  const totals = useMemo(() => {
    const subTotal = chargeItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = Number(form.tax) || 0;
    const discountRate = Number(form.discount) || 0;
    const taxAmount = (subTotal * taxRate) / 100;
    const discountAmount = (subTotal * discountRate) / 100;
    const grandTotal = subTotal + taxAmount - discountAmount;
    
    // Calculate payments based on billing type
    let amountPaid = 0;
    if (form.billingType === 'admission') {
      amountPaid = Number(form.admissionPayment) || 0;
    } else if (form.billingType === 'discharge') {
      // For discharge, amountPaid should be the remaining balance
      amountPaid = Number(form.amountPaid) || 0;
    } else {
      // Full payment
      amountPaid = Number(form.amountPaid) || 0;
    }
    
    const balanceDue = Math.max(grandTotal - amountPaid, 0);

    return {
      subTotal,
      taxAmount,
      discountAmount,
      grandTotal,
      balanceDue,
      amountPaid,
    };
  }, [chargeItems, form.tax, form.discount, form.amountPaid, form.billingType, form.admissionPayment]);

  const handleChargeChange = (key, value) => {
    const numericValue = value === '' ? '' : Math.max(Number(value), 0);
    setChargeValues((prev) => ({ ...prev, [key]: numericValue }));
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setChargeValues(chargeCatalog.reduce((acc, charge) => ({ ...acc, [charge.key]: 0 }), {}));
    setForm((prev) => ({
      ...prev,
      invoiceNumber: '',
      amountPaid: 0,
      billingStaffName: '',
      patientSignatureName: '',
      notes: '',
      billingType: 'full',
      admissionPayment: 0,
    }));
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    if (!form.patient || !form.doctor) {
      setError('Please select both patient and doctor.');
      return;
    }

    if (!chargeItems.length) {
      setError('Add at least one billing item to create the invoice.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        patient: form.patient,
        doctor: form.doctor,
        invoiceNumber: form.invoiceNumber || undefined,
        invoiceDate: form.invoiceDate,
        department:
          selectedDoctor?.department?.name ||
          selectedDoctor?.specialization ||
          'General',
        patientDetails: {
          name: selectedPatient
            ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
            : '',
          admissionNumber: form.patientAdmissionNumber,
          contact: form.patientContact,
        },
        hospitalDetails: {
          name: form.hospitalName,
          contact: form.hospitalContact,
          address: form.hospitalAddress,
        },
        insuranceDetails: {
          provider: form.insuranceProvider,
          policyNumber: form.insurancePolicyNumber,
          coverageAmount: Number(form.insuranceCoverageAmount) || 0,
          coveragePercentage: Number(form.insuranceCoveragePercentage) || 0,
        },
        signatures: {
          billingStaff: form.billingStaffName,
          patient: form.patientSignatureName,
        },
        notes: form.notes,
        items: chargeItems.map((item) => ({
          name: item.category.label,
          quantity: 1,
          unitPrice: item.amount,
        })),
        tax: Number(form.tax) || 0,
        discount: Number(form.discount) || 0,
        amountPaid: totals.amountPaid,
        balanceDue: totals.balanceDue,
        paymentMethod: form.paymentMethod,
        billingType: form.billingType,
        admissionPayment: form.billingType === 'admission' ? Number(form.admissionPayment) || 0 : undefined,
      };

      await invoiceService.create(payload);
      await fetchDependencies();
      resetForm();
    } catch (err) {
      console.error('Failed to create invoice', err);
      setError(err.response?.data?.message || 'Unable to create invoice.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      setError('');
      await invoiceService.markPaid(invoiceId, { paymentMethod: 'cash' });
      await fetchDependencies();
    } catch (err) {
      console.error('Failed to mark invoice paid', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to mark invoice paid.');
    }
  };

  const handleExportPDF = async (invoice) => {
    try {
      // Create a temporary div to render the invoice
      const invoiceElement = document.createElement('div');
      invoiceElement.style.width = '210mm';
      invoiceElement.style.padding = '20mm';
      invoiceElement.style.backgroundColor = 'white';
      invoiceElement.style.fontFamily = 'Arial, sans-serif';
      invoiceElement.style.fontSize = '12px';
      invoiceElement.style.color = '#000';

      const invoiceDate = invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toLocaleDateString()
        : new Date(invoice.createdAt).toLocaleDateString();

      invoiceElement.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin-bottom: 10px; color: #ea580c;">${invoice.hospitalDetails?.name || 'Hospital Invoice'}</h1>
          <p style="color: #666; margin: 5px 0;">${invoice.hospitalDetails?.address || ''}</p>
          <p style="color: #666; margin: 5px 0;">Contact: ${invoice.hospitalDetails?.contact || ''}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2 style="font-size: 18px; margin-bottom: 15px;">Invoice Details</h2>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <p><strong>Department:</strong> ${invoice.department || 'N/A'}</p>
          </div>
          <div>
            <h2 style="font-size: 18px; margin-bottom: 15px;">Patient Information</h2>
            <p><strong>Name:</strong> ${invoice.patientDetails?.name || `${invoice.patient?.firstName || ''} ${invoice.patient?.lastName || ''}`}</p>
            <p><strong>Admission No:</strong> ${invoice.patientDetails?.admissionNumber || 'N/A'}</p>
            <p><strong>Contact:</strong> ${invoice.patientDetails?.contact || invoice.patient?.phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${invoice.patient?.email || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Doctor:</strong> Dr. ${invoice.doctor?.firstName || ''} ${invoice.doctor?.lastName || ''} (${invoice.doctor?.specialization || 'N/A'})</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb;">Item</th>
              <th style="text-align: right; padding: 10px; border: 1px solid #e5e7eb;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #e5e7eb;">${formatCurrency(item.total || item.unitPrice)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div style="margin-left: auto; width: 300px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subTotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Tax (${invoice.tax || 0}%):</span>
            <span>${formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Discount (${invoice.discount || 0}%):</span>
            <span>-${formatCurrency(invoice.discountAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #000; font-weight: bold; font-size: 16px;">
            <span>Total Payable:</span>
            <span>${formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; margin-top: 10px;">
            <span>Amount Paid:</span>
            <span>${formatCurrency(invoice.amountPaid)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #059669; font-weight: bold;">
            <span>Balance Due:</span>
            <span>${formatCurrency(invoice.balanceDue)}</span>
          </div>
        </div>

        ${invoice.insuranceDetails?.provider ? `
          <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <h3 style="margin-bottom: 10px;">Insurance Details</h3>
            <p><strong>Provider:</strong> ${invoice.insuranceDetails.provider}</p>
            <p><strong>Policy Number:</strong> ${invoice.insuranceDetails.policyNumber || 'N/A'}</p>
            <p><strong>Coverage:</strong> ${formatCurrency(invoice.insuranceDetails.coverageAmount || 0)} (${invoice.insuranceDetails.coveragePercentage || 0}%)</p>
          </div>
        ` : ''}

        ${invoice.notes ? `
          <div style="margin-top: 20px;">
            <p><strong>Notes:</strong> ${invoice.notes}</p>
          </div>
        ` : ''}

        <div style="margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <div>
            <p><strong>Billing Staff:</strong> ${invoice.signatures?.billingStaff || '—'}</p>
            <p style="margin-top: 30px;">Signature: _________________</p>
          </div>
          <div>
            <p><strong>Patient/Attendant:</strong> ${invoice.signatures?.patient || '—'}</p>
            <p style="margin-top: 30px;">Signature: _________________</p>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 10px;">
          <p>This is a computer-generated invoice. No signature required.</p>
        </div>
      `;

      document.body.appendChild(invoiceElement);

      // Generate PDF
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${invoice.invoiceNumber}-${invoiceDate.replace(/\//g, '-')}.pdf`);

      // Clean up
      document.body.removeChild(invoiceElement);
    } catch (err) {
      console.error('Failed to export PDF', err);
      setError('Failed to export PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586263451090-5103d2dce4d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-pink-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-orange-100">
              Record hospital billing with detailed financial breakdown.
            </p>
          </div>
          <div className="hidden sm:flex items-center bg-white text-orange-700 px-4 py-2 rounded-xl font-semibold">
            <FiFileText className="mr-2" size={18} />
            Financial Records
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <form onSubmit={handleCreateInvoice} className="space-y-6 bg-white rounded-xl shadow p-6 card-hover">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Create Invoice</h2>
              <div className="text-sm text-gray-500 flex items-center space-x-3">
                <span className="flex items-center">
                  <FiHash className="mr-1" /> Auto-number when blank
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1" /> {form.invoiceDate}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
                  placeholder="Auto-generate if left blank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => handleFormChange('invoiceDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  value={form.patient}
                  onChange={(e) => handleFormChange('patient', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  value={form.doctor}
                  onChange={(e) => handleFormChange('doctor', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Admission Number</label>
                <input
                  type="text"
                  value={form.patientAdmissionNumber}
                  onChange={(e) => handleFormChange('patientAdmissionNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Contact</label>
                <input
                  type="text"
                  value={form.patientContact}
                  onChange={(e) => handleFormChange('patientContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hospital Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={form.hospitalName}
                    onChange={(e) => handleFormChange('hospitalName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                  <input
                    type="text"
                    value={form.hospitalContact}
                    onChange={(e) => handleFormChange('hospitalContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={form.hospitalAddress}
                    onChange={(e) => handleFormChange('hospitalAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Billing Items</h3>
              {chargeCatalog.map((charge) => (
                <div key={charge.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{charge.label}</p>
                    <p className="text-xs text-gray-500">{charge.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={chargeValues[charge.key]}
                      onChange={(e) => handleChargeChange(charge.key, e.target.value)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Insurance Coverage</h3>
                <input
                  type="text"
                  value={form.insuranceProvider}
                  onChange={(e) => handleFormChange('insuranceProvider', e.target.value)}
                  placeholder="Provider"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  value={form.insurancePolicyNumber}
                  onChange={(e) => handleFormChange('insurancePolicyNumber', e.target.value)}
                  placeholder="Policy Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Coverage Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.insuranceCoverageAmount}
                      onChange={(e) => handleFormChange('insuranceCoverageAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Coverage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.insuranceCoveragePercentage}
                      onChange={(e) => handleFormChange('insuranceCoveragePercentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Payment Summary</h3>
                
                {/* Billing Type Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Billing Type</label>
                  <select
                    value={form.billingType}
                    onChange={(e) => handleFormChange('billingType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="full">Full Payment</option>
                    <option value="admission">Admission Payment (Partial)</option>
                    <option value="discharge">Discharge Payment (Remaining)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.billingType === 'admission' && 'Collect partial payment before admitting patient'}
                    {form.billingType === 'discharge' && 'Collect remaining balance after discharging patient'}
                    {form.billingType === 'full' && 'Collect full payment at once'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tax (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.tax}
                      onChange={(e) => handleFormChange('tax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discount}
                      onChange={(e) => handleFormChange('discount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {form.billingType === 'admission' ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Admission Payment (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.admissionPayment}
                        onChange={(e) => handleFormChange('admissionPayment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Partial payment amount"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Remaining: {formatCurrency(totals.grandTotal - (Number(form.admissionPayment) || 0))}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {form.billingType === 'discharge' ? 'Discharge Payment (₹)' : 'Amount Paid (₹)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amountPaid}
                        onChange={(e) => handleFormChange('amountPaid', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder={form.billingType === 'discharge' ? 'Remaining balance' : 'Payment amount'}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Staff Name</label>
                <input
                  type="text"
                  value={form.billingStaffName}
                  onChange={(e) => handleFormChange('billingStaffName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient / Attendant Name</label>
                <input
                  type="text"
                  value={form.patientSignatureName}
                  onChange={(e) => handleFormChange('patientSignatureName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Additional billing notes, insurance remarks, etc."
              />
            </div>

            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Invoice Summary</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({form.tax || 0}%)</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({form.discount || 0}%)</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-dashed border-gray-300 pt-2">
                  <span>Total Payable</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Amount Paid</span>
                  <span>{formatCurrency(form.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Balance Due</span>
                  <span>{formatCurrency(totals.balanceDue)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiFileText className="mr-2" size={18} />
                {saving ? 'Saving...' : 'Save Invoice'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Invoices</h2>
            </div>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No invoices recorded yet. Create the first invoice using the form.
              </p>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiHash className="mr-1" /> {invoice.invoiceNumber}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {invoice.patientDetails?.name ||
                            `${invoice.patient?.firstName || ''} ${invoice.patient?.lastName || ''}`}
                        </h3>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center justify-end">
                          <FiCalendar className="mr-1" />
                          {invoice.invoiceDate
                            ? new Date(invoice.invoiceDate).toLocaleDateString()
                            : new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center justify-end">
                          <FiDollarSign className="mr-1" />
                          {formatCurrency(invoice.grandTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                      <div className="flex items-center">
                        <FiUser className="mr-1" /> Dr. {invoice.doctor?.firstName}{' '}
                        {invoice.doctor?.lastName} ({invoice.department || invoice.doctor?.specialization})
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="mr-1" /> {invoice.patientDetails?.contact || invoice.patient?.phone || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <FiMail className="mr-1" /> {invoice.patient?.email || 'No email'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center">
                          <FiFileText className="mr-1" /> {invoice.paymentMethod?.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            invoice.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : invoice.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {invoice.status?.toUpperCase()}
                        </span>
                        {invoice.billingType && invoice.billingType !== 'full' && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              invoice.billingType === 'admission'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {invoice.billingType === 'admission' ? 'ADMISSION' : 'DISCHARGE'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <table className="w-full text-xs text-gray-600">
                        <tbody>
                          {invoice.items?.map((item) => (
                            <tr key={`${invoice._id}-${item.name}`} className="border-b border-dashed border-gray-200">
                              <td className="py-1 pr-2">{item.name}</td>
                              <td className="py-1 text-right">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        <div>Subtotal: {formatCurrency(invoice.subTotal)}</div>
                        <div>Tax: {formatCurrency(invoice.taxAmount)} | Discount: {formatCurrency(invoice.discountAmount)}</div>
                        <div>Paid: {formatCurrency(invoice.amountPaid)} | Balance: {formatCurrency(invoice.balanceDue)}</div>
                      </div>
                      <div className="flex flex-col space-y-2 items-end">
                        <div className="text-xs text-gray-500">
                          Staff: {invoice.signatures?.billingStaff || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Patient: {invoice.signatures?.patient || '—'}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleExportPDF(invoice)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition"
                            title="Export to PDF"
                          >
                            <FiDownload className="mr-1" size={14} />
                            PDF
                          </button>
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(invoice._id)}
                              className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                            >
                              <FiCheckCircle className="mr-1" size={14} />
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;

