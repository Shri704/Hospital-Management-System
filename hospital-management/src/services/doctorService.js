import api from './api';

export const doctorService = {
  getAll: (params = {}) => api.get('/doctors', { params }),
  getPublic: () => api.get('/doctors/public'), // Public endpoint for patients
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.patch(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

