// frontend/src/api/questionApi.js
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for API calls
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  // For FormData, let the browser set the content type
  if (config.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      // Try to get error message from JSON response
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      // For non-JSON responses (like file downloads), return the response as-is
      return response;
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Get all questions
export const getQuestions = () => {
  return apiRequest('/questions');
};

// Ask a new question
export const askQuestion = (formData) => {
  return apiRequest('/questions/ask', {
    method: 'POST',
    body: formData,
  });
};

// Reply to a question (admin only)
export const replyToQuestion = (questionId, reply) => {
  return apiRequest(`/questions/${questionId}/reply`, {
    method: 'PUT',
    body: JSON.stringify({ reply }),
  });
};

// Update a question
export const updateQuestion = (questionId, updatedData) => {
  return apiRequest(`/questions/${questionId}/edit`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};

// Delete a question
export const deleteQuestion = (questionId) => {
  return apiRequest(`/questions/${questionId}`, {
    method: 'DELETE',
  });
};

// Generate report
export const generateReport = async (format = 'pdf') => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/questions/report?format=${format}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to generate report');
  
  // Get blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `questions-report.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};