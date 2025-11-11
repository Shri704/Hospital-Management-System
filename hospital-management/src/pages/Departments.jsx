import { useEffect, useMemo, useState } from 'react';
import { FiLayers, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { departmentService } from '../services/departmentService';

const initialFormState = {
  name: '',
  description: '',
  head: '',
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await departmentService.getAll();
      const records = response?.data || response || [];
      setDepartments(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.response?.data?.message || 'Unable to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        await departmentService.update(editingId, formData);
      } else {
        await departmentService.create(formData);
      }
      await fetchDepartments();
      resetForm();
    } catch (err) {
      console.error('Error saving department:', err);
      setError(err.response?.data?.message || 'Unable to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (department) => {
    setEditingId(department._id);
    setFormData({
      name: department.name || '',
      description: department.description || '',
      head: department.head?._id || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }
    try {
      await departmentService.delete(id);
      await fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.message || 'Unable to delete department.');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const formTitle = useMemo(
    () => (editingId ? 'Update Department' : 'Add Department'),
    [editingId]
  );

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
          backgroundImage: `url('https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Departments</h1>
            <p className="text-blue-100">
              Organize doctors and services by managing departments.
            </p>
          </div>
          <div className="hidden sm:flex items-center bg-white text-indigo-700 px-4 py-2 rounded-xl font-semibold">
            <FiLayers className="mr-2" size={18} />
            Manage Categories
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{formTitle}</h2>
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Cardiology"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add additional details"
                />
              </div>

              <div className="flex items-end justify-between">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FiPlus className="mr-2" size={18} />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Department List</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-10 text-gray-500">
                        No departments found. Create the first one using the form.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department, index) => (
                      <tr
                        key={department._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition animate-fadeIn"
                        style={{ animationDelay: `${index * 0.02}s` }}
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">{department.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {department.description || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEdit(department)}
                              className="text-blue-600 hover:text-blue-700 transition"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(department._id)}
                              className="text-red-600 hover:text-red-700 transition"
                              title="Delete"
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
      </div>
    </div>
  );
};

export default Departments;

