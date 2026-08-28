import api from './api';

const staffService = {
  getStaffBySalon: (salonId, params) => api.get(`/salons/${salonId}/staff`, { params }),
  getStaffById: (id) => api.get(`/staff/${id}`),
  getStaffAvailability: (staffId, params) => api.get(`/staff/${staffId}/availability`, { params }),
  createStaff: (salonId, data) => api.post(`/salons/${salonId}/staff`, data),
  updateStaff: (id, data) => api.patch(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`)
};

export default staffService;
