import api from './api';

const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getSalons: (params) => api.get('/admin/salons', { params }),
  toggleSalonStatus: (id) => api.patch(`/admin/salons/${id}/toggle-status`),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, data) => api.patch(`/admin/reviews/${id}/moderate`, data),
  getServices: (params) => api.get('/admin/services', { params }),
  toggleServiceStatus: (id) => api.patch(`/admin/services/${id}/toggle-status`),
  getCategories: (params) => api.get('/admin/categories', { params })
};

export default adminService;
