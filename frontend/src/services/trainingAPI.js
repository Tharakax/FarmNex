// Mock API service for training materials CRUD operations
// This simulates backend API calls for development purposes

let mockTrainingMaterials = [];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions
export const trainingAPI = {
  // Get all training materials with filtering and pagination
  async getTrainingMaterials(params = {}) {
    await delay(500); // Simulate network delay

    let filteredMaterials = [...mockTrainingMaterials];
    
    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredMaterials = filteredMaterials.filter(material =>
        material.title.toLowerCase().includes(searchTerm) ||
        material.description.toLowerCase().includes(searchTerm) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply type filter
    if (params.type && params.type !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => 
        material.type.toLowerCase() === params.type.toLowerCase()
      );
    }
    
    // Apply category filter
    if (params.category && params.category !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => 
        material.category.toLowerCase() === params.category.toLowerCase()
      );
    }
    
    // Apply difficulty filter
    if (params.difficulty && params.difficulty !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => 
        material.difficulty.toLowerCase() === params.difficulty.toLowerCase()
      );
    }
    
    // Sort by creation date (newest first)
    filteredMaterials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);
    
    return {
      success: true,
      materials: paginatedMaterials,
      total: filteredMaterials.length,
      page: page,
      totalPages: Math.ceil(filteredMaterials.length / limit),
      limit: limit
    };
  },

  // Get a single training material by ID
  async getTrainingMaterial(id) {
    await delay(300);
    
    const material = mockTrainingMaterials.find(m => m._id === id);
    
    if (!material) {
      throw new Error('Training material not found');
    }
    
    // Increment view count
    material.views += 1;
    
    return {
      success: true,
      material: material
    };
  },

  // Create a new training material
  async createTrainingMaterial(materialData) {
    await delay(800);
    
    // Validate required fields
    if (!materialData.title || !materialData.description) {
      throw new Error('Title and description are required');
    }
    
    // Content is only required for article type
    if (materialData.type === 'article' && !materialData.content) {
      throw new Error('Content is required for articles');
    }
    
    const newMaterial = {
      _id: `material-${Date.now()}`,
      ...materialData,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: materialData.createdBy || 'Current User',

      fileSize: materialData.fileSize || null,
      fileName: materialData.fileName || null,
      fileType: materialData.fileType || null,
      filePath: materialData.filePath || null
    };
    
    mockTrainingMaterials.unshift(newMaterial);
    
    return {
      success: true,
      material: newMaterial,
      message: 'Training material created successfully'
    };
  },

  async updateTrainingMaterial(id, materialData) {
    await delay(800);
    
    const materialIndex = mockTrainingMaterials.findIndex(m => m._id === id);
    
    if (materialIndex === -1) {
      throw new Error('Training material not found');
    }
    
    if (!materialData.title || !materialData.description) {
      throw new Error('Title and description are required');
    }
    
    if (materialData.type === 'article' && !materialData.content) {
      throw new Error('Content is required for articles');
    }
    
    const updatedMaterial = {
      ...mockTrainingMaterials[materialIndex],
      ...materialData,
      _id: id, 
      updatedAt: new Date().toISOString(),
     
      createdAt: mockTrainingMaterials[materialIndex].createdAt,
      views: mockTrainingMaterials[materialIndex].views
    };
    
    mockTrainingMaterials[materialIndex] = updatedMaterial;
    
    return {
      success: true,
      material: updatedMaterial,
      message: 'Training material updated successfully'
    };
  },

  
  async deleteTrainingMaterial(id) {
    await delay(500);
    
    const materialIndex = mockTrainingMaterials.findIndex(m => m._id === id);
    
    if (materialIndex === -1) {
      throw new Error('Training material not found');
    }
    
    const deletedMaterial = mockTrainingMaterials.splice(materialIndex, 1)[0];
    
    return {
      success: true,
      material: deletedMaterial,
      message: 'Training material deleted successfully'
    };
  },

  // Get statistics for dashboard
  async getStatistics() {
    await delay(300);
    
    const totalMaterials = mockTrainingMaterials.length;
    const totalViews = mockTrainingMaterials.reduce((sum, material) => sum + material.views, 0);
    
    // Exact user-specific statistics (replace with real data when available)
    const completedMaterials = 15; // Exact number of completed materials
    const inProgressMaterials = 3;  // Exact number of in-progress materials
    
    return {
      success: true,
      statistics: {
        totalMaterials,
        totalViews,
        completedMaterials,
        inProgressMaterials
      }
    };
  },

  // Get available categories
  async getCategories() {
    await delay(200);
    
    const categories = [...new Set(mockTrainingMaterials.map(material => material.category))];
    
    return {
      success: true,
      categories: categories.sort()
    };
  },

  // Get popular tags
  async getTags() {
    await delay(200);
    
    const allTags = mockTrainingMaterials.flatMap(material => material.tags || []);
    const tagCounts = {};
    
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag);
    
    return {
      success: true,
      tags: popularTags
    };
  }
};

export default trainingAPI;
