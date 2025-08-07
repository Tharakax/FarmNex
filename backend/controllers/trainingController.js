import TrainingMaterial from '../models/TrainingMaterial.js';

// Get all training materials
const getAllMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, search } = req.query;
    
    let query = { isActive: true };
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    const materials = await TrainingMaterial.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await TrainingMaterial.countDocuments(query);
    
    res.json({
      materials,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single training material
const getMaterialById = async (req, res) => {
  try {
    const material = await TrainingMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Training material not found' });
    }
    
    // Increment view count
    material.views += 1;
    await material.save();
    
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new training material
const createMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      uploadLink,
      tags,
      difficulty,
      category,
      createdBy
    } = req.body;
    
    const material = new TrainingMaterial({
      title,
      description,
      type,
      uploadLink,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty,
      category,
      createdBy
    });
    
    if (req.file) {
      material.fileName = req.file.filename;
      material.fileSize = req.file.size;
    }
    
    const savedMaterial = await material.save();
    res.status(201).json(savedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update training material
const updateMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      uploadLink,
      tags,
      difficulty,
      category
    } = req.body;
    
    const updateData = {
      title,
      description,
      type,
      uploadLink,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty,
      category
    };
    
    if (req.file) {
      updateData.fileName = req.file.filename;
      updateData.fileSize = req.file.size;
    }
    
    const material = await TrainingMaterial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({ message: 'Training material not found' });
    }
    
    res.json(material);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete training material (soft delete)
const deleteMaterial = async (req, res) => {
  try {
    const material = await TrainingMaterial.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ message: 'Training material not found' });
    }
    
    res.json({ message: 'Training material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    const totalMaterials = await TrainingMaterial.countDocuments({ isActive: true });
    const totalViews = await TrainingMaterial.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const materialsByType = await TrainingMaterial.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const materialsByCategory = await TrainingMaterial.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalMaterials,
      totalViews: totalViews[0]?.totalViews || 0,
      materialsByType,
      materialsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getStatistics
};
