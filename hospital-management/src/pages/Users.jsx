import { useEffect, useState } from 'react';
import { FiPlus, FiUsers, FiTrash2, FiEdit } from 'react-icons/fi';
import { userService } from '../services/userService';

const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'patient', label: 'Patient' },
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'doctor',
  password: '',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAll();
      const records = response?.data || response || [];
      setUsers(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('Failed to load users', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const payload = { ...formData };
        delete payload.password;
        await userService.update(editingId, payload);
      } else {
        await userService.create(formData);
      }
      await fetchUsers();
      resetForm();
    } catch (err) {
      console.error('Failed to save user', err);
      setError(err.response?.data?.message || 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (user) => {
    setEditingId(user._id);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'doctor',
      password: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await userService.delete(id);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      setError(err.response?.data?.message || 'Unable to delete user.');
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
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
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-blue-100">
              Create and manage staff accounts across the hospital.
            </p>
          </div>
          <div className="hidden sm:flex items-center bg-white text-purple-700 px-4 py-2 rounded-xl font-semibold">
            <FiUsers className="mr-2" size={18} />
            Staff Directory
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Update User' : 'Add New User'}
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={handleInputChange('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Share this password with the staff member; they can update it later.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiPlus className="mr-2" size={18} />
                {saving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No users found. Create your first staff member using the form.
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 hover:bg-gray-50 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.02}s` }}
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-700 transition"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="text-red-600 hover:text-red-700 transition"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            )}
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
      </div>
    </div>
  );
};

export default Users;

