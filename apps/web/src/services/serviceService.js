import api from './api';

const serviceService = {
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (salonId, data) => api.post(`/salons/${salonId}/services`, data),
  updateService: (id, data) => api.patch(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`)
};

export default serviceService;
