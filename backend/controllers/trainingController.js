import TrainingMaterial from '../models/TrainingMaterial.js';
import xlsx from 'xlsx';

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

// Export training materials to Excel
const exportToExcel = async (req, res) => {
  try {
    // Get all active training materials
    const materials = await TrainingMaterial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();

    // Create a new workbook
    const workbook = xlsx.utils.book_new();

    // Sheet 1: Training Materials Overview
    const materialData = materials.map((material, index) => ({
      'S/N': index + 1,
      'Title': material.title,
      'Description': material.description.length > 100 
        ? material.description.substring(0, 100) + '...' 
        : material.description,
      'Type': material.type,
      'Category': material.category,
      'Difficulty': material.difficulty,
      'Views': material.views,
      'Tags': Array.isArray(material.tags) ? material.tags.join(', ') : '',
      'Created By': material.createdBy || 'N/A',
      'Upload Link': material.uploadLink || 'N/A',
      'File Name': material.fileName || 'N/A',
      'File Size (bytes)': material.fileSize || 'N/A',
      'Created Date': material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'N/A',
      'Updated Date': material.updatedAt ? new Date(material.updatedAt).toLocaleDateString() : 'N/A'
    }));

    const materialsSheet = xlsx.utils.json_to_sheet(materialData);
    
    // Set column widths for better readability
    materialsSheet['!cols'] = [
      { wch: 5 },   // S/N
      { wch: 30 },  // Title
      { wch: 50 },  // Description
      { wch: 12 },  // Type
      { wch: 18 },  // Category
      { wch: 12 },  // Difficulty
      { wch: 8 },   // Views
      { wch: 25 },  // Tags
      { wch: 15 },  // Created By
      { wch: 30 },  // Upload Link
      { wch: 20 },  // File Name
      { wch: 15 },  // File Size
      { wch: 12 },  // Created Date
      { wch: 12 }   // Updated Date
    ];

    xlsx.utils.book_append_sheet(workbook, materialsSheet, 'Training Materials');

    // Sheet 2: Statistics by Type
    const typeStats = await TrainingMaterial.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$type', 
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const typeStatsData = typeStats.map((stat, index) => ({
      'S/N': index + 1,
      'Type': stat._id,
      'Count': stat.count,
      'Total Views': stat.totalViews,
      'Average Views': Math.round(stat.avgViews * 100) / 100
    }));

    const typeStatsSheet = xlsx.utils.json_to_sheet(typeStatsData);
    typeStatsSheet['!cols'] = [
      { wch: 5 },   // S/N
      { wch: 15 },  // Type
      { wch: 10 },  // Count
      { wch: 12 },  // Total Views
      { wch: 15 }   // Average Views
    ];

    xlsx.utils.book_append_sheet(workbook, typeStatsSheet, 'Statistics by Type');

    // Sheet 3: Statistics by Category
    const categoryStats = await TrainingMaterial.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryStatsData = categoryStats.map((stat, index) => ({
      'S/N': index + 1,
      'Category': stat._id,
      'Count': stat.count,
      'Total Views': stat.totalViews,
      'Average Views': Math.round(stat.avgViews * 100) / 100
    }));

    const categoryStatsSheet = xlsx.utils.json_to_sheet(categoryStatsData);
    categoryStatsSheet['!cols'] = [
      { wch: 5 },   // S/N
      { wch: 20 },  // Category
      { wch: 10 },  // Count
      { wch: 12 },  // Total Views
      { wch: 15 }   // Average Views
    ];

    xlsx.utils.book_append_sheet(workbook, categoryStatsSheet, 'Statistics by Category');

    // Sheet 4: Statistics by Difficulty
    const difficultyStats = await TrainingMaterial.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$difficulty', 
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const difficultyStatsData = difficultyStats.map((stat, index) => ({
      'S/N': index + 1,
      'Difficulty Level': stat._id,
      'Count': stat.count,
      'Total Views': stat.totalViews,
      'Average Views': Math.round(stat.avgViews * 100) / 100
    }));

    const difficultyStatsSheet = xlsx.utils.json_to_sheet(difficultyStatsData);
    difficultyStatsSheet['!cols'] = [
      { wch: 5 },   // S/N
      { wch: 18 },  // Difficulty Level
      { wch: 10 },  // Count
      { wch: 12 },  // Total Views
      { wch: 15 }   // Average Views
    ];

    xlsx.utils.book_append_sheet(workbook, difficultyStatsSheet, 'Statistics by Difficulty');

    // Sheet 5: Popular Tags Analysis
    const allTags = materials.flatMap(material => material.tags || []);
    const tagCounts = {};
    
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const popularTagsData = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count], index) => ({
        'S/N': index + 1,
        'Tag': tag,
        'Usage Count': count,
        'Percentage': Math.round((count / materials.length) * 100 * 100) / 100 + '%'
      }));

    const tagsSheet = xlsx.utils.json_to_sheet(popularTagsData);
    tagsSheet['!cols'] = [
      { wch: 5 },   // S/N
      { wch: 25 },  // Tag
      { wch: 12 },  // Usage Count
      { wch: 12 }   // Percentage
    ];

    xlsx.utils.book_append_sheet(workbook, tagsSheet, 'Popular Tags');

    // Sheet 6: Overall Summary
    const totalMaterials = materials.length;
    const totalViews = materials.reduce((sum, material) => sum + material.views, 0);
    const avgViews = totalMaterials > 0 ? Math.round((totalViews / totalMaterials) * 100) / 100 : 0;
    const materialsWithFiles = materials.filter(m => m.fileName).length;
    const materialsWithLinks = materials.filter(m => m.uploadLink).length;

    const summaryData = [
      { 'Metric': 'Total Training Materials', 'Value': totalMaterials },
      { 'Metric': 'Total Views Across All Materials', 'Value': totalViews },
      { 'Metric': 'Average Views Per Material', 'Value': avgViews },
      { 'Metric': 'Materials with Uploaded Files', 'Value': materialsWithFiles },
      { 'Metric': 'Materials with External Links', 'Value': materialsWithLinks },
      { 'Metric': 'Most Popular Type', 'Value': typeStats[0]?._id || 'N/A' },
      { 'Metric': 'Most Popular Category', 'Value': categoryStats[0]?._id || 'N/A' },
      { 'Metric': 'Most Common Difficulty', 'Value': difficultyStats[0]?._id || 'N/A' },
      { 'Metric': 'Total Unique Tags', 'Value': Object.keys(tagCounts).length },
      { 'Metric': 'Report Generated Date', 'Value': new Date().toLocaleDateString() },
      { 'Metric': 'Report Generated Time', 'Value': new Date().toLocaleTimeString() }
    ];

    const summarySheet = xlsx.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 35 },  // Metric
      { wch: 20 }   // Value
    ];

    xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary Report');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers for file download
    const filename = `Training_Knowledge_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);

    // Send the buffer as response
    res.send(buffer);

  } catch (error) {
    console.error('Error generating Excel export:', error);
    res.status(500).json({ message: 'Failed to generate Excel export', error: error.message });
  }
};

// Get published training materials for public view (home page)
const getPublishedMaterials = async (req, res) => {
  try {
    const { limit = 6, type, category } = req.query;
    
    let query = { 
      isActive: true, 
      status: 'published' 
    };
    
    // Filter by type if specified
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by category if specified
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const materials = await TrainingMaterial.find(query)
      .sort({ views: -1, createdAt: -1 }) // Sort by popularity then recency
      .limit(limit * 1)
      .select('title description type category difficulty tags views createdAt')
      .exec();
    
    res.json({
      success: true,
      materials,
      total: materials.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getStatistics,
  exportToExcel,
  getPublishedMaterials
};
