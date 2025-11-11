import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentAppointments: () => api.get('/dashboard/recent-appointments'),
  getRecentPatients: () => api.get('/dashboard/recent-patients'),
  getRevenueSummary: () => api.get('/dashboard/revenue-summary'),
};

