import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { departmentService } from '../services/departmentService';
import { FiUser, FiSave, FiArrowLeft } from 'react-icons/fi';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialization: '',
  department: '',
  experienceYears: '',
  consultationFee: '',
  bio: '',
};

const DoctorForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptRes, doctorRes] = await Promise.all([
          departmentService.getAll(),
          isEdit ? doctorService.getById(id) : Promise.resolve(null),
        ]);

        const deptData = deptRes?.data || deptRes || [];
        setDepartments(Array.isArray(deptData) ? deptData : []);

        if (isEdit && doctorRes) {
          const doctorData = doctorRes?.data || doctorRes || {};
          setFormData({
            firstName: doctorData.firstName || '',
            lastName: doctorData.lastName || '',
            email: doctorData.email || '',
            phone: doctorData.phone || '',
            specialization: doctorData.specialization || '',
            department: doctorData.department?._id || '',
            experienceYears: doctorData.experienceYears ?? '',
            consultationFee: doctorData.consultationFee ?? '',
            bio: doctorData.bio || '',
          });
        }
      } catch (err) {
        console.error('Failed to load doctor form data', err);
        setError(err.response?.data?.message || 'Unable to load doctor details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...formData,
      // Convert empty string to null/undefined for department
      department: formData.department || undefined,
      experienceYears: formData.experienceYears ? Number(formData.experienceYears) : 0,
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : 0,
    };

    // Remove department from payload if it's empty
    if (!payload.department) {
      delete payload.department;
    }

    try {
      if (isEdit) {
        await doctorService.update(id, payload);
      } else {
        await doctorService.create(payload);
      }

      navigate('/doctors');
    } catch (err) {
      console.error('Failed to save doctor', err);
      setError(err.response?.data?.message || 'Unable to save doctor details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1583911860506-1cc13dcd4495?auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-emerald-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Update Doctor Profile' : 'Add New Doctor'}
            </h1>
            <p className="text-blue-100">
              {isEdit
                ? 'Edit doctor information and availability.'
                : 'Create a new doctor profile to add them to the roster.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="inline-flex items-center bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold hover-lift transition-smooth"
          >
            <FiArrowLeft className="mr-2" size={18} />
            Back to Doctors
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 card-hover">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-3">
            <FiUser size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Doctor Details' : 'Doctor Information'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange('firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={handleChange('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={handleChange('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={handleChange('specialization')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={handleChange('department')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={handleChange('experienceYears')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
            <input
              type="number"
              min="0"
              value={formData.consultationFee}
              onChange={handleChange('consultationFee')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Notes</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={handleChange('bio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2" size={18} />
              {saving ? 'Saving...' : isEdit ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;

