import api from './api';

const availabilityService = {
  getSalonAvailability: (salonId, params) => api.get(`/salons/${salonId}/availability`, { params }),
  getStaffAvailability: (staffId, params) => api.get(`/staff/${staffId}/availability`, { params })
};

export default availabilityService;
