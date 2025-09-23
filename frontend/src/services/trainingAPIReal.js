import axios from 'axios';
import { saveAs } from 'file-saver';

// Base URL for the training API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
    console.log('🚀 API: createTrainingMaterial called');
    console.log('📝 API: Material data received:', JSON.stringify(materialData, null, 2));
    console.log('📎 API: File received:', !!file);
    
    try {
      const formData = new FormData();
      
      // Debug: Log what we're about to send
      console.log('📤 API: Preparing FormData...');
      
      // Append all text fields
      Object.keys(materialData).forEach(key => {
        if (materialData[key] !== undefined && materialData[key] !== null) {
          // Handle arrays (like tags) properly
          if (Array.isArray(materialData[key])) {
            const tagString = materialData[key].join(',');
            formData.append(key, tagString);
            console.log(`📝 API: Added ${key} as array: ${tagString}`);
          } else {
            formData.append(key, materialData[key]);
            console.log(`📝 API: Added ${key}: ${materialData[key]}`);
          }
        } else {
          console.log(`⚠️  API: Skipping ${key} (undefined/null)`);
        }
      });

      // Append file if provided
      if (file) {
        formData.append('file', file);
        console.log('📎 API: Added file:', { 
          name: file.name, 
          size: file.size, 
          type: file.type,
          lastModified: file.lastModified 
        });
      } else {
        console.log('⚠️  API: No file provided');
      }

      // Debug: Log FormData contents
      console.log('📋 API: FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      console.log('🌐 API: Sending POST request to:', `${API_ENDPOINT}/`);
      console.log('🔑 API: Auth token present:', !!localStorage.getItem('token'));
      
      const response = await api.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ API: Response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return {
        success: true,
        material: response.data,
        message: 'Training material created successfully'
      };
    } catch (error) {
      console.error('❌ API: Create training material failed');
      console.error('❌ API: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create training material';
      console.error('❌ API: Throwing error:', errorMessage);
      throw new Error(errorMessage);
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
