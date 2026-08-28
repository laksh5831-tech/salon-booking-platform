import api from './api';

const appointmentService = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.patch(`/appointments/${id}`, data),
  cancelAppointment: (id, data) => api.post(`/appointments/${id}/cancel`, data)
};

export default appointmentService;
