import api from './api';

const categoryService = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.patch(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  toggleCategoryStatus: (id) => api.patch(`/categories/${id}/toggle-status`)
};

export default categoryService;
