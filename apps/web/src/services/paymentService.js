import api from './api';

const paymentService = {
  createPaymentIntent: (appointmentId) => api.post('/payments/create-intent', { appointmentId }),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
  refundPayment: (paymentId, data) => api.post(`/payments/${paymentId}/refund`, data),
  getMyPayments: (params) => api.get('/payments/my', { params }),
  getSalonPayments: (salonId, params) => api.get(`/payments/salon/${salonId}`, { params }),
  getSalonRevenue: (salonId, params) => api.get(`/payments/salon/${salonId}/revenue`, { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`)
};

export default paymentService;
