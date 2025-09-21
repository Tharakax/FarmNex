const API_BASE_URL = 'http://localhost:3000/api';

const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === 'file' && data[key]) {
      formData.append('file', data[key]);
    } else if (key === 'tags' && Array.isArray(data[key])) {
      // Convert array back to comma-separated string for backend
      formData.append(key, data[key].join(', '));
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

export const trainingAPI = {
  getAllMaterials: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/training?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch training materials');
    }
    
    return response.json();
  },

  getMaterialById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/training/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch training material');
    }
    
    const data = await response.json();
    return data; 
  },

  createMaterial: async (data) => {
    const formData = createFormData(data);
    
    const response = await fetch(`${API_BASE_URL}/training`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create training material');
    }
    
    return response.json();
  },

  updateMaterial: async (id, data) => {
    const formData = createFormData(data);
    
    const response = await fetch(`${API_BASE_URL}/training/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update training material');
    }
    
    return response.json();
  },

  deleteMaterial: async (id) => {
    const response = await fetch(`${API_BASE_URL}/training/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete training material');
    }
    
    return response.json();
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/training/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    
    const data = await response.json();
    return { success: true, statistics: data };
  },
};

export const farmSuppliesAPI = {
  getAllSupplies: async () => {
    const response = await fetch(`${API_BASE_URL}/farmsupplies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch farm supplies');
    }
    
    return response.json();
  },

  getSupplyById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/farmsupplies/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch farm supply');
    }
    
    return response.json();
  },

  createSupply: async (data) => {
    try {
      console.log('Creating supply with data:', data); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/farmsupplies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Create detailed error with response data
        const error = new Error(responseData.message || responseData.error || 'Failed to create farm supply');
        error.response = { data: responseData };
        error.status = response.status;
        throw error;
      }
      
      return responseData;
    } catch (error) {
      // Re-throw with better error context
      if (error.response) {
        throw error; // Already processed
      } else {
        // Network or other error
        throw new Error(`Network error: ${error.message}`);
      }
    }
  },

  updateSupply: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/farmsupplies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update farm supply');
    }
    
    return response.json();
  },

  deleteSupply: async (id) => {
    const response = await fetch(`${API_BASE_URL}/farmsupplies/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete farm supply');
    }
    
    return response.json();
  },
};

export default {
  trainingAPI,
  farmSuppliesAPI,
  API_BASE_URL,
};
