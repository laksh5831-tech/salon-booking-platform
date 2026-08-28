import api from './api';

const salonService = {
  getSalons: (params) => api.get('/salons', { params }),
  getSalonById: (id) => api.get(`/salons/${id}`),
  getSalonBySlug: (slug) => api.get(`/salons/slug/${slug}`),
  getMySalon: () => api.get('/salons/my'),
  createSalon: (data) => api.post('/salons', data),
  updateSalon: (id, data) => api.patch(`/salons/${id}`, data),
  deleteSalon: (id) => api.delete(`/salons/${id}`),
  getSalonServices: (salonId, params) => api.get(`/salons/${salonId}/services`, { params }),
  getSalonStaff: (salonId, params) => api.get(`/salons/${salonId}/staff`, { params }),
  getSalonStats: (salonId) => api.get(`/salons/${salonId}/stats`),
  getSalonStaffLeave: (salonId, params) => api.get(`/salons/${salonId}/staff-leave`, { params })
};

export default salonService;
