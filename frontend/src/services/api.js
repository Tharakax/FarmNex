const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to create FormData for file uploads
const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === 'file' && data[key]) {
      formData.append('file', data[key]);
<<<<<<< HEAD
    } else if (key === 'tags' && Array.isArray(data[key])) {
      // Convert array back to comma-separated string for backend
      formData.append(key, data[key].join(', '));
=======
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
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
    
<<<<<<< HEAD
    const data = await response.json();
    return data; // Return material directly to match backend response
=======
    return response.json();
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
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

<<<<<<< HEAD
// Farm Supplies API methods
export const farmSuppliesAPI = {
  // Get all farm supplies
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

  // Get single farm supply by ID
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

  // Create new farm supply
  createSupply: async (data) => {
    const response = await fetch(`${API_BASE_URL}/farmsupplies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create farm supply');
    }
    
    return response.json();
  },

  // Update farm supply
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

  // Delete farm supply
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

// Export for other components that might need general API functionality
export default {
  trainingAPI,
  farmSuppliesAPI,
=======
// Export for other components that might need general API functionality
export default {
  trainingAPI,
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
  API_BASE_URL,
};
