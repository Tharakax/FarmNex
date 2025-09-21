import TrainingMaterial from '../models/TrainingMaterial.js';
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit';

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
      content,
      uploadLink,
      tags,
      difficulty,
      category,
      status,
      createdBy
    } = req.body;
    
    // Determine creator info based on authenticated user or provided data
    let materialCreatedBy = createdBy || 'Admin';
    let createdByRole = 'admin';
    
    // If user is authenticated, use their info
    if (req.user) {
      materialCreatedBy = req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'User';
      createdByRole = req.user.role || 'user';
    } else if (createdBy && createdBy.toLowerCase().includes('admin')) {
      createdByRole = 'admin';
    }
    
    const material = new TrainingMaterial({
      title,
      description,
      type,
      content,
      uploadLink,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty,
      category,
      status,
      createdBy: materialCreatedBy,
      createdByRole: createdByRole
    });
    
    if (req.file) {
      material.fileName = req.file.filename;
      material.fileSize = req.file.size;
      material.uploadLink = `/uploads/${req.file.filename}`; // Set proper upload link
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
      content,
      uploadLink,
      tags,
      difficulty,
      category,
      status
    } = req.body;
    
    const updateData = {
      title,
      description,
      type,
      content,
      uploadLink,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      difficulty,
      category,
      status
    };
    
    // Only update file info if a new file is uploaded
    if (req.file) {
      updateData.fileName = req.file.filename;
      updateData.fileSize = req.file.size;
      updateData.uploadLink = `/uploads/${req.file.filename}`; // Set proper upload link
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

// Export training materials to PDF - OPTIMIZED VERSION
const exportToPDF = async (req, res) => {
  try {
    // Get all active training materials with more comprehensive data
    const materials = await TrainingMaterial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();

    // Create a new PDF document with better settings and automatic page handling
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      autoFirstPage: true,
      bufferPages: true,
      info: {
        Title: 'FarmNex Training Materials Report',
        Author: 'FarmNex Training Management System',
        Subject: 'Training Materials Analysis and Statistics',
        Keywords: 'training, agriculture, materials, analytics, farmnex'
      }
    });

    // Set response headers
    const filename = `FarmNex_Training_Materials_Detailed_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Enhanced colors and styling
    const colors = {
      primary: '#16A34A', // Green
      secondary: '#374151', // Dark gray
      accent: '#2563EB', // Blue
      text: '#111827', // Almost black
      lightText: '#6B7280', // Light gray
      success: '#059669', // Success green
      warning: '#D97706', // Warning orange
      error: '#DC2626', // Error red
      background: '#F9FAFB' // Light background
    };

    // Helper function to draw FarmNex leaf logo
    const drawFarmNexLogo = (x, y, size = 30) => {
      // Save the current graphics state
      doc.save();
      
      // Draw leaf shape using curves
      const leafWidth = size;
      const leafHeight = size * 1.2;
      
      // Leaf outline
      doc.fillColor('#22C55E') // Green leaf color
         .moveTo(x, y + leafHeight * 0.8)
         .quadraticCurveTo(x + leafWidth * 0.3, y, x + leafWidth, y + leafHeight * 0.4)
         .quadraticCurveTo(x + leafWidth * 0.7, y + leafHeight, x, y + leafHeight * 0.8)
         .fill();
      
      // Leaf stem
      doc.fillColor('#16A34A') // Darker green for stem
         .rect(x + leafWidth * 0.45, y + leafHeight * 0.8, 2, leafHeight * 0.15)
         .fill();
      
      // Leaf vein
      doc.strokeColor('#FFFFFF')
         .lineWidth(1)
         .moveTo(x + leafWidth * 0.15, y + leafHeight * 0.7)
         .lineTo(x + leafWidth * 0.8, y + leafHeight * 0.3)
         .stroke();
      
      // Restore graphics state
      doc.restore();
    };
    
    // Helper function to add professional header with FarmNex logo
    const addHeader = (title, subtitle = null, isFirstPage = false) => {
      // Only add header if we have content
      if (!title) return 40;
      
      // Background header rectangle - optimized height
      const headerHeight = subtitle ? 100 : 80;
      doc.rect(0, 0, doc.page.width, headerHeight).fill(colors.primary);
      
      // Draw FarmNex logo with leaf
      drawFarmNexLogo(45, 18, 24);
      
      // Company name and branding
      doc.fontSize(24).fillColor('#FFFFFF').font('Helvetica-Bold').text('FarmNex', 85, 22);
      doc.fontSize(9).fillColor('#E0F2FE').font('Helvetica').text('Agricultural Training Management System', 85, 45);
      
      // Report title
      doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold').text(title, 40, 60);
      
      if (subtitle) {
        doc.fontSize(9).fillColor('#E0F2FE').font('Helvetica').text(subtitle, 40, 78);
      }
      
      return headerHeight + 20; // Return Y position after header with padding
    };

    // Helper function for section headers with smart spacing
    const addSectionHeader = (title, yPos) => {
      // Check if we have enough space, if not start new page
      if (yPos > doc.page.height - 100) {
        doc.addPage();
        yPos = addHeader('Training Materials Report', 'Continued');
      }
      
      doc.rect(40, yPos, doc.page.width - 80, 25).fill(colors.background).stroke(colors.primary);
      doc.fontSize(14).fillColor(colors.primary).text(title, 50, yPos + 5);
      return yPos + 35;
    };

    // Helper function for subsection headers with space checking
    const addSubsectionHeader = (title, yPos) => {
      // Check if we have enough space
      if (yPos > doc.page.height - 80) {
        doc.addPage();
        yPos = addHeader('Training Materials Report', 'Continued');
      }
      
      doc.fontSize(12).fillColor(colors.accent).text(title, 50, yPos);
      doc.moveTo(50, yPos + 15).lineTo(doc.page.width - 50, yPos + 15).stroke(colors.accent);
      return yPos + 25;
    };

    // Helper function for smart page management
    const checkPageSpace = (requiredSpace, currentY) => {
      if (currentY + requiredSpace > doc.page.height - 60) {
        doc.addPage();
        return addHeader('Training Materials Report', 'Continued');
      }
      return currentY;
    };
    
    // Helper function for page footer with logo
    const addFooter = () => {
      const pageHeight = doc.page.height;
      
      // Footer line
      doc.strokeColor(colors.lightText)
         .lineWidth(0.5)
         .moveTo(40, pageHeight - 45)
         .lineTo(doc.page.width - 40, pageHeight - 45)
         .stroke();
      
      // Small logo in footer
      drawFarmNexLogo(40, pageHeight - 40, 12);
      
      // Footer text
      doc.fontSize(8).fillColor(colors.lightText).font('Helvetica')
         .text(`Generated: ${new Date().toLocaleString()}`, 65, pageHeight - 32)
         .text('© 2024 FarmNex Agricultural Training System', doc.page.width - 220, pageHeight - 32);
    };

    // SINGLE PAGE REPORT WITH SMART CONTENT ORGANIZATION
    let yPos = addHeader('Training Materials Report', 'Comprehensive Analysis & Statistics', true);
    
    yPos += 10;
    
    // Calculate comprehensive statistics FIRST
    const totalMaterials = materials.length;
    const totalViews = materials.reduce((sum, material) => sum + (material.views || 0), 0);
    const avgViews = totalMaterials > 0 ? Math.round((totalViews / totalMaterials) * 100) / 100 : 0;
    const materialsWithFiles = materials.filter(m => m.fileName).length;
    const materialsWithLinks = materials.filter(m => m.uploadLink).length;
    const materialsWithContent = materials.filter(m => m.content && m.content.trim().length > 0).length;
    
    // Recent materials (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMaterials = materials.filter(m => new Date(m.createdAt) > thirtyDaysAgo).length;
    
    // Most active month
    const monthCounts = {};
    materials.forEach(m => {
      const month = new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const mostActiveMonth = Object.entries(monthCounts).sort(([,a], [,b]) => b - a)[0];

    // Only add executive summary if we have space
    yPos = checkPageSpace(120, yPos);
    
    // Compact Executive Summary Box
    doc.rect(40, yPos, doc.page.width - 80, 100)
       .fill('#F0F9FF')
       .stroke(colors.accent);
    
    yPos += 10;
    doc.fontSize(14).fillColor(colors.primary).text('Executive Summary', 50, yPos);
    yPos += 20;
    
    // Compact summary with key metrics only
    const summaryItems = [
      `Materials: ${totalMaterials} | Views: ${totalViews.toLocaleString()} | Avg: ${avgViews}`,
      `Files: ${materialsWithFiles} (${Math.round(materialsWithFiles/totalMaterials*100)}%) | Links: ${materialsWithLinks} (${Math.round(materialsWithLinks/totalMaterials*100)}%)`,
      `Content: ${materialsWithContent} (${Math.round(materialsWithContent/totalMaterials*100)}%) | Recent: ${recentMaterials}`,
      `Peak Period: ${mostActiveMonth ? mostActiveMonth[0] : 'N/A'} (${mostActiveMonth ? mostActiveMonth[1] : 0} materials)`
    ];
    
    summaryItems.forEach(item => {
      doc.fontSize(9).fillColor(colors.text).text(item, 50, yPos);
      yPos += 14;
    });
    
    yPos += 15;
    
    // Only add insights if we have space
    yPos = checkPageSpace(100, yPos);
    
    // Compact Key Insights Box
    doc.rect(40, yPos, doc.page.width - 80, 80)
       .fill('#FEFCE8')
       .stroke(colors.warning);
    
    yPos += 10;
    doc.fontSize(12).fillColor(colors.warning).text('Key Insights', 50, yPos);
    yPos += 20;
    
    // Calculate insights
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
    
    // Compact insights - only show the most important ones
    const insights = [
      `Top Type: ${typeStats[0]?._id || 'N/A'} (${typeStats[0]?.count || 0})`,
      `Top Category: ${categoryStats[0]?._id || 'N/A'} (${categoryStats[0]?.count || 0})`,
      `Engagement: ${avgViews > 50 ? 'High' : avgViews > 20 ? 'Moderate' : 'Low'}`
    ];
    
    insights.forEach(insight => {
      doc.fontSize(9).fillColor(colors.text).text(`• ${insight}`, 50, yPos);
      yPos += 12;
    });

    yPos += 20;
    
    // MATERIALS INVENTORY (Compact Table)
    yPos = checkPageSpace(200, yPos);
    yPos = addSectionHeader('Training Materials', yPos);
    
    // Compact table with essential columns only
    const tableHeaders = ['Title', 'Type', 'Category', 'Views', 'Status'];
    const colWidths = [200, 70, 90, 50, 70];
    let xPos = 40;
    
    // Table header background
    doc.rect(40, yPos, doc.page.width - 80, 20).fill(colors.primary);
    
    doc.fontSize(8).fillColor('#FFFFFF');
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos + 3, yPos + 5, { width: colWidths[i] - 6, align: 'center' });
      xPos += colWidths[i];
    });
    
    yPos += 20;
    
    // Show only top 10 materials to keep report compact
    const topMaterials = materials.slice(0, 10);
    
    topMaterials.forEach((material, index) => {
      // Check if we need more space
      yPos = checkPageSpace(15, yPos);
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.rect(40, yPos, doc.page.width - 80, 14).fill('#F9FAFB');
      }
      
      xPos = 40;
      doc.fontSize(7).fillColor(colors.text);
      
      const status = material.status || 'Published';
      const statusColor = status === 'published' ? colors.success : 
                         status === 'draft' ? colors.warning : colors.lightText;
      
      const rowData = [
        material.title?.length > 30 ? material.title.substring(0, 30) + '...' : (material.title || 'Untitled'),
        material.type || 'N/A',
        material.category?.length > 15 ? material.category.substring(0, 15) + '...' : (material.category || 'N/A'),
        (material.views || 0).toString(),
        status
      ];
      
      rowData.forEach((data, i) => {
        const color = i === 4 ? statusColor : colors.text; // Status column gets special color
        doc.fillColor(color).text(data, xPos + 2, yPos + 3, { width: colWidths[i] - 4, align: i === 3 ? 'center' : 'left' });
        xPos += colWidths[i];
      });
      
      yPos += 14;
    });
    
    // Add note about showing top 10 only
    if (materials.length > 10) {
      yPos += 10;
      doc.fontSize(8).fillColor(colors.lightText)
         .text(`Showing top 10 of ${materials.length} total materials`, 40, yPos);
      yPos += 15;
    }

    // SIMPLE STATISTICS SECTION
    yPos += 20;
    yPos = checkPageSpace(100, yPos);
    yPos = addSectionHeader('Quick Statistics', yPos);
    
    // Compact statistics - only show top performers
    if (typeStats.length > 0) {
      doc.fontSize(9).fillColor(colors.text)
         .text('Content Types:', 50, yPos);
      yPos += 15;
      
      typeStats.slice(0, 3).forEach(stat => {
        const percentage = Math.round((stat.count / totalMaterials) * 100);
        doc.fontSize(8).fillColor(colors.text)
           .text(`${stat._id}: ${stat.count} (${percentage}%)`, 60, yPos);
        yPos += 12;
      });
    }
    
    yPos += 10;
    
    if (categoryStats.length > 0) {
      doc.fontSize(9).fillColor(colors.text)
         .text('Categories:', 50, yPos);
      yPos += 15;
      
      categoryStats.slice(0, 3).forEach(stat => {
        const percentage = Math.round((stat.count / totalMaterials) * 100);
        doc.fontSize(8).fillColor(colors.text)
           .text(`${stat._id}: ${stat.count} (${percentage}%)`, 60, yPos);
        yPos += 12;
      });
    }

    // Add footer and finalize
    yPos += 30;
    addFooter();
    
    // Finalize the PDF
    doc.end();


  } catch (error) {
    console.error('Error generating detailed PDF export:', error);
    res.status(500).json({ message: 'Failed to generate detailed PDF export', error: error.message });
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
  exportToPDF,
  getPublishedMaterials
};
