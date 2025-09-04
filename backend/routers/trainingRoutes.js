import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getStatistics,
  exportToExcel,
  getPublishedMaterials
} from '../controllers/trainingController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|avi|mov|wmv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, documents, and videos are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

// Routes
router.get('/export/excel', exportToExcel);
router.get('/statistics', getStatistics);
router.get('/published', getPublishedMaterials); // Public endpoint for published materials
router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.post('/', upload.single('file'), createMaterial);
router.put('/:id', upload.single('file'), updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;
