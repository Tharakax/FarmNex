// Environment configuration for different environments

const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    FRONTEND_URL: 'http://localhost:5173'
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://your-production-api.com',
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://your-production-frontend.com'
  }
};

const env = import.meta.env.MODE || 'development';

export const API_BASE_URL = config[env].API_BASE_URL;
export const FRONTEND_URL = config[env].FRONTEND_URL;

// Helper function to get file URL
export const getFileUrl = (filePath, fileName) => {
  if (filePath) {
    // If filePath starts with http, it's already a full URL
    if (filePath.startsWith('http')) {
      return filePath;
    }
    // If filePath starts with /, prepend API base URL
    if (filePath.startsWith('/')) {
      return `${API_BASE_URL}${filePath}`;
    }
    // Otherwise, assume it's a relative path in uploads
    return `${API_BASE_URL}/uploads/${filePath}`;
  }
  
  if (fileName) {
    return `${API_BASE_URL}/uploads/${fileName}`;
  }
  
  return null;
};

export default {
  API_BASE_URL,
  FRONTEND_URL,
  getFileUrl
};