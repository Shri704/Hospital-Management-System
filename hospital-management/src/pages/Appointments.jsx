import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { FiPlus, FiCalendar } from 'react-icons/fi';

const Appointments = () => {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';
  const canManagePatients = ['admin', 'doctor', 'receptionist'].includes(user?.role);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    timeSlot: '',
    reason: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments - backend now handles filtering for patients
      const apptsRes = await appointmentService.getAll();
      const allAppointments = apptsRes?.data || apptsRes || [];
      
      setAppointments(allAppointments);

      // Fetch doctors - use public endpoint for patients
      try {
        const doctorsRes = isPatient 
          ? await doctorService.getPublic()
          : await doctorService.getAll();
        setDoctors(doctorsRes?.data || doctorsRes || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      }

      // Only fetch patients if user has permission
      if (canManagePatients) {
        try {
          const patientsRes = await patientService.getAll();
          setPatients(patientsRes?.data || patientsRes || []);
        } catch (error) {
          console.error('Error fetching patients:', error);
          setPatients([]);
        }
      } else {
        // For patients, set their own info if available
        if (user?._id) {
          setPatients([{ _id: user._id, firstName: user.firstName, lastName: user.lastName }]);
          setFormData(prev => ({ ...prev, patient: user._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await appointmentService.create(formData);
      setShowModal(false);
      setFormData({
        patient: '',
        doctor: '',
        date: '',
        timeSlot: '',
        reason: '',
        status: 'pending',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-blue-100">Create and manage appointments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-purple-700 px-4 py-2 rounded-xl font-semibold hover-lift transition-smooth"
          >
            <span className="inline-flex items-center"><FiPlus className="mr-2" size={18} />New Appointment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 card-hover">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No appointments found
            </div>
          ) : (
            appointments.map((appt, idx) => (
              <div
                key={appt._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow animate-fadeIn"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      appt.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <FiCalendar className="mr-2" size={16} />
                    {new Date(appt.date).toLocaleDateString()}
                  </p>
                  {appt.timeSlot && <p>Time: {appt.timeSlot}</p>}
                  {appt.reason && <p>Reason: {appt.reason}</p>}
                </div>
                {canManagePatients && (
                  <div className="mt-3 flex space-x-2">
                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-scaleIn shadow-2xl">
            <h2 className="text-xl font-bold mb-4">New Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {canManagePatients ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select
                    required
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <input
                    type="text"
                    value={user ? `${user.firstName} ${user.lastName}` : ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  required
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                <input
                  type="text"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  placeholder="e.g., 10:00 AM - 10:30 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-smooth"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

