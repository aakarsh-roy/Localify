import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getBookings: (params) => api.get('/users/bookings', { params }),
  updateLocation: (data) => api.put('/users/location', data),
};

// Provider APIs
export const providerAPI = {
  getAll: (params) => api.get('/providers', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  register: (data) => api.post('/providers/register', data),
  updateProfile: (data) => api.put('/providers/profile', data),
  getMyBookings: (params) => api.get('/providers/my/bookings', { params }),
  getMyReviews: (params) => api.get('/providers/my/reviews', { params }),
  updateAvailability: (data) => api.put('/providers/availability', data),
  getReviews: (id, params) => api.get(`/providers/${id}/reviews`, { params }),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancel: (id, data) => api.delete(`/bookings/${id}`, { data }),
};

// Review APIs
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  respond: (id, data) => api.post(`/reviews/${id}/respond`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getProviders: (params) => api.get('/admin/providers', { params }),
  verifyProvider: (id, data) => api.put(`/admin/providers/${id}/verify`, data),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, data) => api.put(`/admin/reviews/${id}/moderate`, data),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export default api;
