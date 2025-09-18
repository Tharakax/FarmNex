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
  exportToPDF,
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
  // Enhanced file type validation with more formats
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|txt|mp4|avi|mov|wmv|webm|mkv|mp3|wav|m4a|ogg|flac|zip|rar|7z|xls|xlsx|ppt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // More comprehensive MIME type checking
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain',
    // Videos
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Spreadsheets
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Presentations
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not supported. Please upload supported file types only.`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for training materials
    files: 1, // Only allow 1 file at a time
    fieldSize: 25 * 1024 * 1024, // 25MB limit for form field data
    fieldNameSize: 100, // Limit field name size
    fields: 20 // Maximum number of non-file form fields
  },
  fileFilter: fileFilter
});

// Error handling middleware for file uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size allowed is 500MB.', 
        error: 'FILE_TOO_LARGE',
        maxSize: '500MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Only 1 file is allowed per upload.', 
        error: 'TOO_MANY_FILES' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected file field. Please use "file" as the field name.', 
        error: 'UNEXPECTED_FIELD' 
      });
    }
  }
  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ 
      message: err.message, 
      error: 'INVALID_FILE_TYPE' 
    });
  }
  next(err);
};

// Routes
router.get('/export/excel', exportToExcel);
router.get('/export/pdf', exportToPDF);
router.get('/statistics', getStatistics);
router.get('/published', getPublishedMaterials); // Public endpoint for published materials
router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.post('/', upload.single('file'), handleUploadError, createMaterial);
router.put('/:id', upload.single('file'), handleUploadError, updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;
