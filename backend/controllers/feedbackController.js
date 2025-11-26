import Feedback from '../models/Feedback.js';
import XLSX from 'xlsx';
import moment from 'moment';

// @desc    Get all feedback with search, filtering, and pagination
// @route   GET /api/feedback
// @access  Public
const getFeedback = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      rating,
      status,
      priority,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Convert to proper types
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build query object
    let query = {};

    // Text search across multiple fields
    if (search && search.trim()) {
      // Instead of using text search, use regex for more flexible searching
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by rating
    if (rating) {
      query.rating = rating;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const feedback = await Feedback.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Feedback.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Public
const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Public (with date restrictions)
const updateFeedback = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if feedback can be edited (within date limit)
    const daysDifference = Math.floor((Date.now() - feedback.createdAt) / (1000 * 60 * 60 * 24));
    const editLimit = parseInt(process.env.EDIT_DELETE_DAYS_LIMIT) || 7;

    if (daysDifference > editLimit) {
      return res.status(403).json({
        success: false,
        message: `Feedback can only be edited within ${editLimit} days of submission`
      });
    }

    // Update the feedback
    feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Public (with date restrictions)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if feedback can be deleted (within date limit)
    const daysDifference = Math.floor((Date.now() - feedback.createdAt) / (1000 * 60 * 60 * 24));
    const deleteLimit = parseInt(process.env.EDIT_DELETE_DAYS_LIMIT) || 7;

    if (daysDifference > deleteLimit) {
      return res.status(403).json({
        success: false,
        message: `Feedback can only be deleted within ${deleteLimit} days of submission`
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export feedback to Excel
// @route   GET /api/feedback/export
// @access  Public
const exportFeedback = async (req, res, next) => {
  try {
    const {
      search,
      category,
      rating,
      status,
      priority,
      startDate,
      endDate
    } = req.query;

    // Build query object (same as getFeedback but without pagination)
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (rating) {
      query.rating = rating;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Get all feedback matching the criteria
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for Excel export
    const excelData = feedback.map(item => ({
      'ID': item._id.toString(),
      'Customer Name': item.customerName,
      'Email': item.email,
      'Category': item.category,
      'Rating': item.rating,
      'Subject': item.subject,
      'Message': item.message,
      'Status': item.status,
      'Priority': item.priority,
      'Tags': item.tags ? item.tags.join(', ') : '',
      'Created Date': moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      'Updated Date': moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // ID
      { wch: 20 }, // Customer Name
      { wch: 30 }, // Email
      { wch: 15 }, // Category
      { wch: 8 },  // Rating
      { wch: 50 }, // Subject
      { wch: 80 }, // Message
      { wch: 12 }, // Status
      { wch: 12 }, // Priority
      { wch: 30 }, // Tags
      { wch: 20 }, // Created Date
      { wch: 20 }  // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const filename = `feedback_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Public
const getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          categoryStats: {
            $push: {
              category: '$category',
              rating: '$rating'
            }
          }
        }
      }
    ]);

    // Get category-wise statistics
    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get rating distribution
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get status distribution
    const statusStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: stats[0]?.totalFeedback || 0,
        averageRating: Math.round((stats[0]?.averageRating || 0) * 100) / 100,
        categoryStats,
        ratingStats,
        statusStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  exportFeedback,
  getFeedbackStats
};
