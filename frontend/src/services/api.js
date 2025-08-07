const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to create FormData for file uploads
const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === 'file' && data[key]) {
      formData.append('file', data[key]);
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// Training API methods
export const trainingAPI = {
  // Get all training materials with filtering
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

  // Get single training material by ID
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
    
    return response.json();
  },

  // Create new training material
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

  // Update training material
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

  // Delete training material
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

  // Get training statistics
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
    return { data };
  },
};

// Export for other components that might need general API functionality
export default {
  trainingAPI,
  API_BASE_URL,
};
