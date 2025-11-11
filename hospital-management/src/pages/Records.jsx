import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  FiActivity,
  FiPlus,
  FiTrash2,
  FiClipboard,
  FiUser,
  FiLayers,
  FiFileText,
  FiMail,
  FiX,
} from 'react-icons/fi';
import { recordService } from '../services/recordService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';

const Records = () => {
  // State declarations - all hooks at the top
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Form state
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    secondaryDiagnosis: '',
    medicalHistory: '',
    familyHistory: '',
    symptoms: '',
    notes: '',
    treatmentPlan: '',
    progressNotes: '',
    doctorNotes: '',
    nursingNotes: '',
    dischargeSummary: '',
    followUpInstructions: '',
    followUpDate: '',
  });

  const [vitals, setVitals] = useState({
    bloodPressure: '',
    pulse: '',
    temperature: '',
    respirationRate: '',
    spo2: '',
    weight: '',
  });

  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '' }]);
  const [tests, setTests] = useState([{ name: '', result: '', date: '' }]);
  const [surgeryDetails, setSurgeryDetails] = useState([{ name: '', date: '', outcome: '', notes: '' }]);

  // Memoized values - computed after state declarations
  const selectedPatient = useMemo(
    () => patients.find((p) => p._id === form.patient),
    [patients, form.patient]
  );

  const viewMode = useMemo(() => (selectedPatientId ? 'patient' : 'all'), [selectedPatientId]);

  // Fetch initial data
  const fetchDependencies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [patientsRes, doctorsRes, recordsRes] = await Promise.all([
        patientService.getAll(),
        doctorService.getAll(),
        selectedPatientId ? recordService.getAllByPatient(selectedPatientId) : recordService.getAll(),
      ]);

      const patientsData = Array.isArray(patientsRes?.data) ? patientsRes.data : Array.isArray(patientsRes) ? patientsRes : [];
      const doctorsData = Array.isArray(doctorsRes?.data) ? doctorsRes.data : Array.isArray(doctorsRes) ? doctorsRes : [];
      const recordsData = Array.isArray(recordsRes?.data) ? recordsRes.data : Array.isArray(recordsRes) ? recordsRes : [];

      setPatients(patientsData);
      setDoctors(doctorsData);
      setRecords(recordsData);
    } catch (err) {
      console.error('Failed to load data', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load data.');
      setPatients([]);
      setDoctors([]);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  // Load data on mount and when patient selection changes
  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Handlers
  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVitalsChange = useCallback((field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addMedication = useCallback(() => {
    setMedications((prev) => [...prev, { name: '', dosage: '', duration: '' }]);
  }, []);

  const removeMedication = useCallback((index) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateMedication = useCallback((index, field, value) => {
    setMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
  }, []);

  const addTest = useCallback(() => {
    setTests((prev) => [...prev, { name: '', result: '', date: '' }]);
  }, []);

  const removeTest = useCallback((index) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateTest = useCallback((index, field, value) => {
    setTests((prev) =>
      prev.map((test, i) => (i === index ? { ...test, [field]: value } : test))
    );
  }, []);

  const addSurgery = useCallback(() => {
    setSurgeryDetails((prev) => [...prev, { name: '', date: '', outcome: '', notes: '' }]);
  }, []);

  const removeSurgery = useCallback((index) => {
    setSurgeryDetails((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSurgery = useCallback((index, field, value) => {
    setSurgeryDetails((prev) =>
      prev.map((surgery, i) => (i === index ? { ...surgery, [field]: value } : surgery))
    );
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      patient: '',
      doctor: '',
      diagnosis: '',
      secondaryDiagnosis: '',
      medicalHistory: '',
      familyHistory: '',
      symptoms: '',
      notes: '',
      treatmentPlan: '',
      progressNotes: '',
      doctorNotes: '',
      nursingNotes: '',
      dischargeSummary: '',
      followUpInstructions: '',
      followUpDate: '',
    });
    setVitals({
      bloodPressure: '',
      pulse: '',
      temperature: '',
      respirationRate: '',
      spo2: '',
      weight: '',
    });
    setMedications([{ name: '', dosage: '', duration: '' }]);
    setTests([{ name: '', result: '', date: '' }]);
    setSurgeryDetails([{ name: '', date: '', outcome: '', notes: '' }]);
    setError('');
  }, []);

  const handleCreateRecord = useCallback(async (e) => {
    e.preventDefault();
    
    if (!form.doctor || !form.diagnosis) {
      setError('Doctor and Primary Diagnosis are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        patient: form.patient || undefined,
        doctor: form.doctor,
        diagnosis: form.diagnosis,
        secondaryDiagnosis: form.secondaryDiagnosis || undefined,
        medicalHistory: form.medicalHistory || undefined,
        familyHistory: form.familyHistory || undefined,
        symptoms: form.symptoms || undefined,
        notes: form.notes || undefined,
        treatmentPlan: form.treatmentPlan || undefined,
        progressNotes: form.progressNotes || undefined,
        doctorNotes: form.doctorNotes || undefined,
        nursingNotes: form.nursingNotes || undefined,
        dischargeSummary: form.dischargeSummary || undefined,
        followUpInstructions: form.followUpInstructions || undefined,
        followUpDate: form.followUpDate || undefined,
        vitals: Object.values(vitals).some((v) => v) ? vitals : undefined,
        medications: medications.filter((m) => m.name && m.dosage && m.duration),
        tests: tests.filter((t) => t.name),
        surgeryDetails: surgeryDetails.filter((s) => s.name),
      };

      await recordService.create(payload);
      await fetchDependencies();
      resetForm();
    } catch (err) {
      console.error('Failed to create record', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to create medical record.');
    } finally {
      setSaving(false);
    }
  }, [form, vitals, medications, tests, surgeryDetails, fetchDependencies, resetForm]);

  const handleDelete = useCallback(async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) {
      return;
    }

    try {
      setError('');
      await recordService.delete(recordId);
      await fetchDependencies();
    } catch (err) {
      console.error('Failed to delete record', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to delete medical record.');
    }
  }, [fetchDependencies]);

  const handlePatientFilter = useCallback((patientId) => {
    setSelectedPatientId(patientId || '');
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading medical records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn px-2 sm:px-0">
      {/* Error Display */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-scaleIn flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 ml-4"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white min-h-[120px] sm:min-h-[160px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1585432959449-b1c79a8472ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 to-blue-600/90" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Medical Record Center</h1>
            <p className="text-cyan-100 text-xs sm:text-sm mt-1">
              Capture clinical history, vitals, treatments, and follow-up details.
            </p>
          </div>
          <div className="hidden sm:flex items-center bg-white text-cyan-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm">
            <FiActivity className="mr-2" size={16} />
            Clinical Timeline
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Form Section */}
        <div className="xl:col-span-2">
          <form onSubmit={handleCreateRecord} className="space-y-4 sm:space-y-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 card-hover animate-scaleIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Add Medical Record</h2>
              {selectedPatient && (
                <div className="text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="flex items-center">
                    <FiUser className="mr-1" size={14} /> {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  {selectedPatient.email && (
                    <span className="flex items-center">
                      <FiMail className="mr-1" size={14} /> {selectedPatient.email}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Patient and Doctor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  value={form.patient}
                  onChange={(e) => handleFormChange('patient', e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300"
                >
                  <option value="">Select patient (optional)</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.doctor}
                  onChange={(e) => handleFormChange('doctor', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300"
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

            {/* Diagnosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Primary Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => handleFormChange('diagnosis', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Secondary Diagnosis</label>
                <input
                  type="text"
                  value={form.secondaryDiagnosis}
                  onChange={(e) => handleFormChange('secondaryDiagnosis', e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300"
                />
              </div>
            </div>

            {/* Medical History */}
            <div className="border rounded-xl p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-cyan-50/30 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <textarea
                    rows="3"
                    value={form.medicalHistory}
                    onChange={(e) => handleFormChange('medicalHistory', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300 resize-none"
                    placeholder="Past illnesses, chronic diseases, allergies"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Family History</label>
                  <textarea
                    rows="3"
                    value={form.familyHistory}
                    onChange={(e) => handleFormChange('familyHistory', e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300 resize-none"
                    placeholder="Diabetes, heart disease, hereditary conditions"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                <textarea
                  rows="2"
                  value={form.symptoms}
                  onChange={(e) => handleFormChange('symptoms', e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300 resize-none"
                  placeholder="Recorded symptoms"
                />
              </div>
            </div>

            {/* Vitals */}
            <div className="border rounded-xl p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-cyan-50/30">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FiActivity className="mr-2" size={16} /> Vital Signs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {Object.entries(vitals).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleVitalsChange(key, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="-"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="border rounded-xl p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-cyan-50/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                  <FiClipboard className="mr-2" size={16} /> Medications
                </h3>
                <button
                  type="button"
                  onClick={addMedication}
                  className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center px-2 py-1 rounded-lg hover:bg-cyan-50 transition-all"
                >
                  <FiPlus className="mr-1" size={14} /> Add Medication
                </button>
              </div>
              {medications.map((med, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    placeholder="Medication name"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    placeholder="Dosage"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tests */}
            <div className="border rounded-xl p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-cyan-50/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                  <FiLayers className="mr-2" size={16} /> Tests & Reports
                </h3>
                <button
                  type="button"
                  onClick={addTest}
                  className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center px-2 py-1 rounded-lg hover:bg-cyan-50 transition-all"
                >
                  <FiPlus className="mr-1" size={14} /> Add Test
                </button>
              </div>
              {tests.map((test, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={test.name}
                    onChange={(e) => updateTest(index, 'name', e.target.value)}
                    placeholder="Test name"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    value={test.result}
                    onChange={(e) => updateTest(index, 'result', e.target.value)}
                    placeholder="Result"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={test.date}
                      onChange={(e) => updateTest(index, 'date', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    {tests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTest(index)}
                        className="px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Treatment Plan */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
              <textarea
                rows="3"
                value={form.treatmentPlan}
                onChange={(e) => handleFormChange('treatmentPlan', e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300 resize-none"
                placeholder="Treatment plan and recommendations"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all hover:border-cyan-300 resize-none"
                placeholder="Any additional notes or observations"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all hover:scale-105 font-medium text-sm sm:text-base"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 btn-glow text-sm sm:text-base"
              >
                <FiPlus className="mr-2" size={18} />
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 card-hover animate-scaleIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                {viewMode === 'all' ? 'All Medical Records' : 'Patient Records'}
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Records</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {records.length} record{records.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {records.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm text-center py-6 sm:py-8">
                No medical records found. Add new entries using the form.
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {records.map((record, index) => (
                  <div
                    key={record._id}
                    className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all card-hover animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{record.diagnosis}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {record.createdAt ? new Date(record.createdAt).toLocaleString() : ''}
                        </p>
                        {viewMode === 'all' && record.patient && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Patient: {record.patient?.firstName} {record.patient?.lastName}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-700 transition-all hover:scale-110 p-1"
                        title="Delete Record"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    {record.symptoms && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 break-words">
                        <span className="font-semibold">Symptoms:</span> {record.symptoms}
                      </p>
                    )}
                    {record.medications?.length > 0 && (
                      <div className="mt-2 text-xs sm:text-sm text-gray-600">
                        <span className="font-semibold">Medications:</span>
                        <ul className="list-disc list-inside mt-1">
                          {record.medications.map((med, idx) => (
                            <li key={idx}>
                              {med.name} — {med.dosage} for {med.duration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

export default Records;
