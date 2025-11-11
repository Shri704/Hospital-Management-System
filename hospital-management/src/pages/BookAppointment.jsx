import { useEffect, useState } from 'react';
import api from '../services/api';
import { FiCalendar, FiUser, FiPhone, FiMail, FiUserPlus } from 'react-icons/fi';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    doctor: '',
    date: '',
    timeSlot: '',
    reason: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/doctors/public');
        setDoctors(res?.data || res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const payload = {
        patientInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
        },
        doctor: form.doctor,
        date: form.date,
        timeSlot: form.timeSlot,
        reason: form.reason,
      };
      await api.post('/appointments/book', payload);
      setMessage('Appointment request submitted! We will confirm shortly.');
      setForm({ firstName: '', lastName: '', phone: '', email: '', doctor: '', date: '', timeSlot: '', reason: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Book an Appointment</h1>
          <p className="mt-2 text-blue-100">Fill the form below and we will confirm your slot.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
          {message && (
            <div className="p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200">{message}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} required className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <FiUserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} required className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} required className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select value={form.doctor} onChange={(e)=>setForm({...form, doctor: e.target.value})} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} {d.specialization ? `- ${d.specialization}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})} required className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <input value={form.timeSlot} onChange={(e)=>setForm({...form, timeSlot: e.target.value})} placeholder="e.g., 10:00 AM - 10:30 AM" required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <button disabled={submitting || loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            {submitting ? 'Submitting...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
