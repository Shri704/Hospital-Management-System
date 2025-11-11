import api from './api';

export const recordService = {
  getAll: (params = {}) => api.get('/records', { params }),
  getAllByPatient: (patientId) => api.get(`/records/patient/${patientId}`),
  getById: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.patch(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
};

