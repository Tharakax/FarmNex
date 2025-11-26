import express from 'express';
import {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  exportFeedback,
  getFeedbackStats
} from '../controllers/feedbackController.js';

// Note: validation middleware not implemented yet
// import {
//   validateFeedback,
//   validateUpdateFeedback,
//   validateQuery
// } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/feedback/export
// @desc    Export feedback to Excel
// @access  Public
router.get('/export', exportFeedback);

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics
// @access  Public
router.get('/stats', getFeedbackStats);

// @route   GET /api/feedback
// @desc    Get all feedback with filtering and pagination
// @access  Public
router.get('/', getFeedback);

// @route   GET /api/feedback/:id
// @desc    Get single feedback by ID
// @access  Public
router.get('/:id', getFeedbackById);

// @route   POST /api/feedback
// @desc    Create new feedback
// @access  Public
router.post('/', createFeedback);

// @route   PUT /api/feedback/:id
// @desc    Update feedback (with date restrictions)
// @access  Public
router.put('/:id', updateFeedback);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (with date restrictions)
// @access  Public
router.delete('/:id', deleteFeedback);

export default router;
