import express from 'express';
import {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  generateCropReport
} from '../controllers/CropController.js';

const router = express.Router();

// Crop PDF
router.get("/report/pdf", generateCropReport);

// Create a new crop plan
router.post('/add', createCrop);

// Get all crop plans
router.get('/get', getAllCrops);

// Get crop plan by ID
router.get('/get/:id', getCropById);

// Update crop plan
router.put('/update/:id', updateCrop);

// Delete crop plan
router.delete('/delete/:id', deleteCrop);

export default router;