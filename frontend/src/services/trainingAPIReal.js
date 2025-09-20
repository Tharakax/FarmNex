import axios from 'axios';
import { saveAs } from 'file-saver';

// Base URL for the training API
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/training`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Training API service
export const trainingAPIReal = {
  // Get all training materials with filtering and pagination
  async getTrainingMaterials(params = {}) {
    try {
      const response = await api.get('/', { params });
      return {
        success: true,
        materials: response.data.materials,
        total: response.data.total,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch training materials');
    }
  },

  // Get a single training material by ID
  async getTrainingMaterial(id) {
    try {
      const response = await api.get(`/${id}`);
      return {
        success: true,
        material: response.data
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch training material');
    }
  },

  // Create a new training material
  async createTrainingMaterial(materialData, file = null) {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(materialData).forEach(key => {
        if (materialData[key] !== undefined && materialData[key] !== null) {
          // Handle arrays (like tags) properly
          if (Array.isArray(materialData[key])) {
            formData.append(key, materialData[key].join(','));
          } else {
            formData.append(key, materialData[key]);
          }
        }
      });

      // Append file if provided
      if (file) {
        formData.append('file', file);
      }

      // Debug logging
      console.log('API: Creating material with data:', materialData);
      console.log('API: File provided:', !!file);
      if (file) {
        console.log('API: File details:', { name: file.name, size: file.size, type: file.type });
      }

      const response = await api.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        material: response.data,
        message: 'Training material created successfully'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create training material');
    }
  },

  // Update an existing training material
  async updateTrainingMaterial(id, materialData, file = null) {
    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(materialData).forEach(key => {
        if (materialData[key] !== undefined && materialData[key] !== null) {
          // Handle arrays (like tags) properly
          if (Array.isArray(materialData[key])) {
            formData.append(key, materialData[key].join(','));
          } else {
            formData.append(key, materialData[key]);
          }
        }
      });

      // Append file if provided
      if (file) {
        formData.append('file', file);
      }

      const response = await api.put(`/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        material: response.data,
        message: 'Training material updated successfully'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update training material');
    }
  },

  // Delete a training material
  async deleteTrainingMaterial(id) {
    try {
      const response = await api.delete(`/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete training material');
    }
  },

  // Get statistics for dashboard
  async getStatistics() {
    try {
      const response = await api.get('/statistics');
      return {
        success: true,
        statistics: response.data
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // Export training materials to Excel
  async exportToExcel() {
    try {
      const response = await api.get('/export/excel', {
        responseType: 'blob', // Important for file downloads
        timeout: 60000 // 60 seconds timeout for large exports
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Generate filename with current date
      const filename = `Training_Knowledge_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Use file-saver to download the file
      saveAs(blob, filename);

      return {
        success: true,
        message: 'Excel file downloaded successfully',
        filename: filename
      };
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error(error.response?.data?.message || 'Failed to export to Excel');
    }
  },

  // Export training materials to PDF
  async exportToPDF() {
    try {
      const response = await api.get('/export/pdf', {
        responseType: 'blob', // Important for file downloads
        timeout: 60000 // 60 seconds timeout for large exports
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: 'application/pdf'
      });

      // Generate filename with current date
      const filename = `Training_Materials_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      // Use file-saver to download the file
      saveAs(blob, filename);

      return {
        success: true,
        message: 'PDF file downloaded successfully',
        filename: filename
      };
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error(error.response?.data?.message || 'Failed to export to PDF');
    }
  },

  // Download training material file
  async downloadFile(materialId, fileName) {
    try {
      const response = await api.get(`/download/${materialId}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      saveAs(blob, fileName);

      return {
        success: true,
        message: 'File downloaded successfully'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download file');
    }
  },

  // Get published training materials for public view (home page)
  async getPublishedMaterials(params = {}) {
    try {
      const response = await api.get('/published', { params });
      return {
        success: true,
        materials: response.data.materials,
        total: response.data.total
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch published materials');
    }
  }
};

export default trainingAPIReal;
