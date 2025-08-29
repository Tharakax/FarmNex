import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Product API service functions
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      console.log('🚀 ProductAPI: Making request to /api/product');
      console.log('🚀 ProductAPI: Base URL:', API_BASE_URL);
      console.log('🚀 ProductAPI: Full URL:', `${API_BASE_URL}/api/product`);
      
      // Check if we have a token
      const token = localStorage.getItem('token');
      console.log('🔐 ProductAPI: Auth token present:', !!token);
      
      const response = await api.get('/api/product');
      
      console.log('✅ ProductAPI: Response received:', {
        status: response.status,
        statusText: response.statusText,
        dataLength: response.data?.length,
        data: response.data
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ ProductAPI: Error fetching products:', error);
      console.error('❌ ProductAPI: Error details:', {
        message: error.message,
        code: error.code,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout
        },
        isAxiosError: error.isAxiosError,
        stack: error.stack
      });
      
      // Check for specific error types
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ ProductAPI: Connection refused - backend server may be down');
      } else if (error.code === 'NETWORK_ERROR') {
        console.error('❌ ProductAPI: Network error - check internet connection');
      } else if (error.response?.status === 401) {
        console.error('❌ ProductAPI: Unauthorized - check authentication');
      } else if (error.response?.status === 404) {
        console.error('❌ ProductAPI: Not found - check API endpoint');
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch products',
        errorCode: error.code,
        errorStatus: error.response?.status
      };
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/api/product/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product',
      };
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/api/product', productData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create product',
      };
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/api/product/${id}`, productData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/api/product/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  // Get farmer's products (assuming there's an endpoint for this)
  getFarmerProducts: async (farmerId) => {
    try {
      const response = await api.get(`/api/product/farmer/${farmerId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching farmer products:', error);
      // Fallback to get all products and filter on frontend
      return productAPI.getAllProducts();
    }
  },

  // Upload product image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload image',
      };
    }
  },
};

export default productAPI;
