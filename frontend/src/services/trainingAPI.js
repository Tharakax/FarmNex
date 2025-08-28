// Mock API service for training materials CRUD operations
// This simulates backend API calls for development purposes

let mockTrainingMaterials = [
  {
    _id: '1',
    title: 'Modern Crop Rotation Techniques',
    description: 'Learn about sustainable crop rotation methods that improve soil health and increase yields.',
    type: 'Video',
    category: 'Crop Management',
    difficulty: 'Intermediate',
    content: `# Modern Crop Rotation Techniques

## Introduction
Crop rotation is one of the oldest and most effective agricultural practices for maintaining soil health and maximizing yields. This comprehensive guide will teach you modern approaches to crop rotation that combine traditional wisdom with contemporary agricultural science.

## Benefits of Crop Rotation
- **Soil Health Improvement**: Different crops contribute various nutrients and organic matter
- **Pest and Disease Control**: Breaking cycles reduces pest populations
- **Weed Management**: Different crops compete with different weed species
- **Nutrient Management**: Legumes fix nitrogen, reducing fertilizer needs

## Planning Your Rotation
1. **Assess Your Land**: Understand soil types, drainage, and climate
2. **Identify Your Goals**: Yield maximization, soil improvement, pest control
3. **Choose Compatible Crops**: Consider nutrient needs and growth patterns
4. **Plan the Timeline**: Account for growing seasons and market demands

## Common Rotation Systems
- **Four-Field System**: Grain → Legume → Root crop → Fallow/Pasture
- **Three-Field System**: Cereal → Legume → Fallow
- **Cover Crop Integration**: Using winter cover crops between main seasons

## Implementation Tips
- Start small with pilot areas
- Keep detailed records of each field's history
- Monitor soil health indicators
- Adjust based on results and changing conditions`,
    views: 145,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'Dr. John Smith',
    tags: ['rotation', 'sustainability', 'soil-health'],
    estimatedDuration: '25 minutes',
    prerequisites: 'Basic understanding of farming practices',
    learningObjectives: [
      'Understand the principles of crop rotation',
      'Learn to plan effective rotation systems',
      'Implement rotation strategies on your farm'
    ]
  },
  {
    _id: '2',
    title: 'Organic Pest Control Guide',
    description: 'Complete guide to managing pests using organic and natural methods.',
    type: 'PDF',
    category: 'Crop Management',
    difficulty: 'Beginner',
    content: `# Organic Pest Control Guide

## Why Choose Organic Pest Control?
Organic pest control methods protect beneficial insects, reduce chemical residues, and maintain ecological balance while effectively managing pest populations.

## Integrated Pest Management (IPM) Approach
1. **Prevention**: Healthy soil and plants are naturally more resistant
2. **Monitoring**: Regular inspection to catch problems early
3. **Identification**: Know your pests and their life cycles
4. **Action**: Use targeted, least-toxic methods first

## Natural Pest Control Methods

### Biological Controls
- **Beneficial insects**: Ladybugs, lacewings, parasitic wasps
- **Birds**: Encourage natural predators with nesting boxes
- **Companion planting**: Use plants that repel pests naturally

### Organic Sprays and Treatments
- **Neem oil**: Effective against aphids, mites, and caterpillars
- **Diatomaceous earth**: Controls crawling insects
- **Soap spray**: Simple solution for soft-bodied pests
- **Essential oils**: Peppermint, rosemary, and thyme oils

### Physical Controls
- **Row covers**: Protect crops from flying pests
- **Copper tape**: Deters slugs and snails
- **Sticky traps**: Monitor and control flying insects
- **Handpicking**: Effective for larger pests

## Common Pests and Solutions
- **Aphids**: Soap spray, beneficial insects
- **Caterpillars**: Bacillus thuringiensis (Bt)
- **Slugs**: Beer traps, copper barriers
- **Spider mites**: Increase humidity, predatory mites`,
    views: 89,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    createdBy: 'Sarah Johnson',
    tags: ['organic', 'pest-control', 'natural-methods'],
    estimatedDuration: '15 minutes',
    prerequisites: 'None - suitable for beginners',
    learningObjectives: [
      'Identify common garden pests',
      'Apply organic control methods',
      'Develop an IPM strategy'
    ]
  },
  {
    _id: '3',
    title: 'Livestock Feed Management',
    description: 'Optimize your livestock nutrition with proper feed management techniques.',
    type: 'Article',
    category: 'Livestock',
    difficulty: 'Advanced',
    content: `# Livestock Feed Management

## Understanding Nutritional Needs
Different livestock species and production stages require specific nutritional profiles for optimal health and productivity.

## Feed Categories
### Roughages
- **Hay**: Primary fiber source for ruminants
- **Silage**: Fermented feed with high moisture content
- **Pasture**: Fresh grass and legumes

### Concentrates
- **Grains**: High energy sources (corn, barley, oats)
- **Protein supplements**: Soybean meal, canola meal
- **Mineral supplements**: Essential vitamins and minerals

## Feed Management Best Practices
1. **Quality Testing**: Regular analysis of feed composition
2. **Storage**: Proper handling to prevent spoilage and contamination
3. **Feeding Schedules**: Consistent timing and portions
4. **Record Keeping**: Track feed consumption and animal performance

## Cost Optimization Strategies
- Buy feed in bulk during harvest season
- Negotiate group purchasing agreements
- Consider on-farm feed production
- Monitor feed conversion ratios

## Common Feeding Mistakes
- Inconsistent feeding schedules
- Poor storage leading to spoilage
- Inadequate mineral supplementation
- Overfeeding or underfeeding`,
    views: 234,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-05').toISOString(),
    createdBy: 'Mike Wilson',
    tags: ['livestock', 'nutrition', 'feed-management'],
    estimatedDuration: '30 minutes',
    prerequisites: 'Experience with livestock management',
    learningObjectives: [
      'Calculate proper feed rations',
      'Optimize feed costs',
      'Improve feed conversion efficiency'
    ]
  },
  {
    _id: '4',
    title: 'Soil Health Assessment',
    description: 'Learn how to evaluate and improve soil health using modern techniques.',
    type: 'Guide',
    category: 'Soil Management',
    difficulty: 'Intermediate',
    content: `# Soil Health Assessment Guide

## What is Soil Health?
Soil health refers to the continued capacity of soil to function as a vital living ecosystem that sustains plants, animals, and humans.

## Key Indicators
### Physical Properties
- **Soil texture**: Sand, silt, clay composition
- **Structure**: Aggregation and porosity
- **Compaction**: Bulk density measurements
- **Water infiltration**: Rate of water absorption

### Chemical Properties
- **pH levels**: Affects nutrient availability
- **Nutrient content**: NPK and micronutrients
- **Organic matter**: Critical for soil biology
- **Cation exchange capacity**: Nutrient holding ability

### Biological Properties
- **Microbial activity**: Soil respiration tests
- **Earthworm populations**: Indicator of biological health
- **Root health**: Disease presence and vigor

## Testing Methods
1. **Soil samples**: Proper collection and analysis
2. **Field observations**: Visual and physical assessment
3. **Laboratory analysis**: Professional testing services
4. **On-farm testing**: Simple DIY methods

## Improvement Strategies
- Add organic matter through compost and cover crops
- Reduce tillage to preserve soil structure
- Practice crop rotation to enhance biology
- Manage water to prevent erosion and compaction`,
    views: 178,
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
    createdBy: 'Dr. Emily Chen',
    tags: ['soil-health', 'testing', 'assessment'],
    estimatedDuration: '20 minutes',
    prerequisites: 'Basic farming knowledge',
    learningObjectives: [
      'Conduct soil health assessments',
      'Interpret test results',
      'Develop improvement plans'
    ]
  }
];

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
    if (!materialData.title || !materialData.description || !materialData.content) {
      throw new Error('Title, description, and content are required');
    }
    
    const newMaterial = {
      _id: `material-${Date.now()}`,
      ...materialData,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: materialData.createdBy || 'Current User'
    };
    
    mockTrainingMaterials.unshift(newMaterial);
    
    return {
      success: true,
      material: newMaterial,
      message: 'Training material created successfully'
    };
  },

  // Update an existing training material
  async updateTrainingMaterial(id, materialData) {
    await delay(800);
    
    const materialIndex = mockTrainingMaterials.findIndex(m => m._id === id);
    
    if (materialIndex === -1) {
      throw new Error('Training material not found');
    }
    
    // Validate required fields
    if (!materialData.title || !materialData.description || !materialData.content) {
      throw new Error('Title, description, and content are required');
    }
    
    const updatedMaterial = {
      ...mockTrainingMaterials[materialIndex],
      ...materialData,
      _id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      // Preserve certain fields
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

  // Delete a training material
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
    
    // Mock user-specific statistics
    const completedMaterials = Math.floor(totalMaterials * 0.3);
    const inProgressMaterials = Math.floor(totalMaterials * 0.2);
    
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
