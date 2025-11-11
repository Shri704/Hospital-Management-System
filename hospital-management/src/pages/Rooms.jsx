import { useEffect, useState, useMemo } from 'react';
import {
  FiHome,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiCalendar,
} from 'react-icons/fi';
import { roomService } from '../services/roomService';
import { patientService } from '../services/patientService';

const roomTypes = [
  { value: 'general', label: 'General Ward', color: 'blue' },
  { value: 'private', label: 'Private Room', color: 'purple' },
  { value: 'ICU', label: 'ICU', color: 'red' },
  { value: 'emergency', label: 'Emergency', color: 'orange' },
  { value: 'operation', label: 'Operation Theater', color: 'green' },
];

const statusColors = {
  available: 'bg-green-100 text-green-700 border-green-200',
  occupied: 'bg-red-100 text-red-700 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    roomNumber: '',
    type: 'general',
    capacity: 1,
    status: 'available',
  });

  const [assignmentForm, setAssignmentForm] = useState({
    roomId: '',
    patientId: '',
    admittedDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchRooms();
    fetchPatients();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await roomService.getAll();
      const roomsData = response?.data || response || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      console.error('Failed to load rooms', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAll();
      const patientsData = response?.data || response || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error('Failed to load patients', err);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || room.type === filterType;
      const matchesStatus = !filterStatus || room.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, searchTerm, filterType, filterStatus]);

  const availabilityStats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === 'available').length;
    const occupied = rooms.filter((r) => r.status === 'occupied').length;
    const maintenance = rooms.filter((r) => r.status === 'maintenance').length;
    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 1), 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + (r.occupiedBeds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;

    return {
      total,
      available,
      occupied,
      maintenance,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0,
    };
  }, [rooms]);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAssignmentChange = (key, value) => {
    setAssignmentForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      roomNumber: '',
      type: 'general',
      capacity: 1,
      status: 'available',
    });
    setEditingId(null);
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity || 1,
      status: room.status,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        await roomService.update(editingId, form);
      } else {
        await roomService.create(form);
      }
      await fetchRooms();
      resetForm();
    } catch (err) {
      console.error('Failed to save room', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to save room.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }
    try {
      await roomService.delete(id);
      await fetchRooms();
    } catch (err) {
      console.error('Failed to delete room', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to delete room.');
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    if (!assignmentForm.roomId || !assignmentForm.patientId) {
      setError('Please select both room and patient.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const room = rooms.find((r) => r._id === assignmentForm.roomId);
      if (!room) {
        setError('Room not found.');
        return;
      }

      if (room.status === 'occupied' && room.occupiedBeds >= room.capacity) {
        setError('Room is at full capacity.');
        return;
      }

      if (room.status === 'maintenance') {
        setError('Room is under maintenance and cannot be assigned.');
        return;
      }

      const updatedPatient = room.patient ? [...room.patient, assignmentForm.patientId] : [assignmentForm.patientId];
      const newOccupiedBeds = (room.occupiedBeds || 0) + 1;
      const newStatus = newOccupiedBeds >= room.capacity ? 'occupied' : 'available';

      await roomService.update(assignmentForm.roomId, {
        patient: updatedPatient,
        occupiedBeds: newOccupiedBeds,
        status: newStatus,
        admittedDate: assignmentForm.admittedDate,
      });

      await fetchRooms();
      setAssignmentForm({
        roomId: '',
        patientId: '',
        admittedDate: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error('Failed to assign patient', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to assign patient to room.');
    } finally {
      setSaving(false);
    }
  };

  const handleDischargePatient = async (roomId, patientId) => {
    if (!window.confirm('Are you sure you want to discharge this patient from the room?')) {
      return;
    }

    try {
      const room = rooms.find((r) => r._id === roomId);
      if (!room) {
        setError('Room not found.');
        return;
      }

      const updatedPatients = Array.isArray(room.patient)
        ? room.patient.filter((p) => p.toString() !== patientId.toString())
        : [];
      const newOccupiedBeds = Math.max((room.occupiedBeds || 0) - 1, 0);
      const newStatus = newOccupiedBeds === 0 ? 'available' : room.status;

      await roomService.update(roomId, {
        patient: updatedPatients,
        occupiedBeds: newOccupiedBeds,
        status: newStatus,
        dischargedDate: new Date().toISOString(),
      });

      await fetchRooms();
    } catch (err) {
      console.error('Failed to discharge patient', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to discharge patient.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Room Management</h1>
            <p className="text-indigo-100">
              Manage hospital rooms, check availability, and assign patients to rooms.
            </p>
          </div>
          <div className="hidden sm:flex items-center bg-white text-indigo-700 px-4 py-2 rounded-xl font-semibold">
            <FiHome className="mr-2" size={18} />
            Room Availability
          </div>
        </div>
      </div>

      {/* Availability Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-800">{availabilityStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiHome className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{availabilityStats.available}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{availabilityStats.occupied}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiXCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{availabilityStats.occupancyRate}%</p>
              <p className="text-xs text-gray-500">
                {availabilityStats.occupiedBeds}/{availabilityStats.totalBeds} beds
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiAlertCircle className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add/Edit Room Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Edit Room' : 'Add New Room'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={form.roomNumber}
                  onChange={(e) => handleFormChange('roomNumber', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 101, ICU-01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={form.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {roomTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Beds)</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 1)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiPlus className="mr-2" size={18} />
                {saving ? 'Saving...' : editingId ? 'Update Room' : 'Create Room'}
              </button>
            </form>
          </div>

          {/* Assign Patient Form */}
          <div className="bg-white rounded-xl shadow p-6 card-hover mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Assign Patient to Room</h2>
            <form onSubmit={handleAssignPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <select
                  value={assignmentForm.roomId}
                  onChange={(e) => handleAssignmentChange('roomId', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select room</option>
                  {rooms
                    .filter((r) => r.status !== 'maintenance' && (r.occupiedBeds || 0) < (r.capacity || 1))
                    .map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNumber} ({room.type}) - {room.capacity - (room.occupiedBeds || 0)} beds available
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  value={assignmentForm.patientId}
                  onChange={(e) => handleAssignmentChange('patientId', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  value={assignmentForm.admittedDate}
                  onChange={(e) => handleAssignmentChange('admittedDate', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiUser className="mr-2" size={18} />
                {saving ? 'Assigning...' : 'Assign Patient'}
              </button>
            </form>
          </div>
        </div>

        {/* Rooms List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6 card-hover">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-800">Rooms</h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 sm:flex-none sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">All Types</option>
                  {roomTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No rooms found. Create your first room using the form.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredRooms.map((room) => {
                  const roomType = roomTypes.find((t) => t.value === room.type);
                  const availableBeds = (room.capacity || 1) - (room.occupiedBeds || 0);
                  const isFull = availableBeds === 0;

                  return (
                    <div
                      key={room._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Room {room.roomNumber}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusColors[room.status] || statusColors.available}`}
                            >
                              {room.status?.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                              {roomType?.label || room.type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-semibold">Capacity:</span> {room.capacity || 1} beds
                            </div>
                            <div>
                              <span className="font-semibold">Occupied:</span> {room.occupiedBeds || 0} beds
                            </div>
                            <div>
                              <span className="font-semibold">Available:</span>{' '}
                              <span className={isFull ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                {availableBeds} beds
                              </span>
                            </div>
                            {room.admittedDate && (
                              <div className="flex items-center text-xs">
                                <FiCalendar className="mr-1" />
                                {new Date(room.admittedDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {Array.isArray(room.patient) && room.patient.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Assigned Patients:</p>
                              <div className="space-y-2">
                                {room.patient.map((patientId, idx) => {
                                  const patient = patients.find((p) => p._id === patientId);
                                  return patient ? (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                                    >
                                      <div className="flex items-center">
                                        <FiUser className="mr-2 text-gray-500" size={16} />
                                        <span className="text-sm text-gray-800">
                                          {patient.firstName} {patient.lastName}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleDischargePatient(room._id, patientId)}
                                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition"
                                      >
                                        Discharge
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(room)}
                            className="text-blue-600 hover:text-blue-700 transition"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(room._id)}
                            className="text-red-600 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;

