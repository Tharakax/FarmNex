import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

// Feedback API functions
export const feedbackAPI = {
  // Get all feedback with filters and pagination
  getFeedback: (params = {}) => {
    return api.get('/feedback', { params });
  },

  // Get feedback by ID
  getFeedbackById: (id) => {
    return api.get(`/feedback/${id}`);
  },

  // Create new feedback
  createFeedback: (data) => {
    return api.post('/feedback', data);
  },

  // Update feedback
  updateFeedback: (id, data) => {
    return api.put(`/feedback/${id}`, data);
  },

  // Delete feedback
  deleteFeedback: (id) => {
    return api.delete(`/feedback/${id}`);
  },

  // Export feedback to Excel
  exportFeedback: (params = {}) => {
    return api.get('/feedback/export', { 
      params, 
      responseType: 'blob' 
    });
  },

  // Get feedback statistics
  getFeedbackStats: () => {
    return api.get('/feedback/stats');
  },
};

// Health check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;
