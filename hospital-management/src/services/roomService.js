import api from './api';

export const roomService = {
  getAll: (params = {}) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.patch(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  getAvailable: (params = {}) => api.get('/rooms', { params: { ...params, status: 'available' } }),
};

