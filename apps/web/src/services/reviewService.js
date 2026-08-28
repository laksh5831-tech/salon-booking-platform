import api from './api';

const reviewService = {
  getSalonReviews: (salonId, params) => api.get(`/reviews/salon/${salonId}`, { params }),
  createReview: (salonId, data) => api.post(`/reviews/salon/${salonId}`, data),
  updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};

export default reviewService;
