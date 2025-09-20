import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const productAPI = {
  getAllProducts: async () => {
    try {
      console.log('🚀 ProductAPI: Making request to /api/product');
      console.log('🚀 ProductAPI: Base URL:', API_BASE_URL);
      console.log('🚀 ProductAPI: Full URL:', `${API_BASE_URL}/api/product`);
      
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

  createProduct: async (productData) => {
  try {
    console.log('📦 Sending product data:', productData);

    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (key === 'stock' && typeof productData[key] === 'object') {
          // Handle nested stock object by flattening it
          Object.keys(productData[key]).forEach((stockKey) => {
            formData.append(`stock.${stockKey}`, productData[key][stockKey]);
          });
        } else if (Array.isArray(productData[key])) {
          // Handle arrays by converting to JSON string
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    // If productData has an image file, append it
    if (productData.image) {
      formData.append('image', productData.image);
    }

    const response = await api.post('/api/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Product created successfully:', response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error creating product:', error);

    let errorMessage = 'Failed to create product';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error - check your connection or backend server';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - server took too long to respond';
    }

    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
      errorStatus: error.response?.status,
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
