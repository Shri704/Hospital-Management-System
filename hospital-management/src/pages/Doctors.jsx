import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAll({ q: searchTerm });
      setDoctors(response?.data || response || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setTimeout(() => {
      fetchDoctors();
    }, 500);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.delete(id);
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor');
      }
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
          backgroundImage: `url('https://images.unsplash.com/photo-1586802974628-98d02753eea1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-blue-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctors</h1>
            <p className="text-blue-100">Manage doctors and their profiles</p>
          </div>
          <Link
            to="/doctors/new"
            className="bg-white text-emerald-700 px-4 py-2 rounded-xl font-semibold hover-lift transition-smooth"
          >
            <span className="inline-flex items-center"><FiPlus className="mr-2" size={18} />Add Doctor</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 card-hover">
        <div className="mb-4">
          <div className="relative animate-fadeIn">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Specialization</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No doctors found
                  </td>
                </tr>
              ) : (
                doctors.map((doctor, idx) => (
                  <tr key={doctor._id} className="border-b border-gray-100 hover:bg-gray-50 animate-fadeIn" style={{ animationDelay: `${idx * 0.02}s` }}>
                    <td className="py-3 px-4">
                      {doctor.firstName} {doctor.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{doctor.specialization || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{doctor.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{doctor.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/doctors/${doctor._id}/edit`}
                          className="text-blue-600 hover:text-blue-700 transition-smooth"
                        >
                          <FiEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(doctor._id)}
                          className="text-red-600 hover:text-red-700 transition-smooth"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Doctors;

