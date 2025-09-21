// Enhanced file validation and processing utilities for training materials
// Includes file type validation, virus scanning simulation, and metadata extraction

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Configuration for file validation
 */
export const VALIDATION_CONFIG = {
  // Maximum file size (1GB)
  maxFileSize: 1024 * 1024 * 1024,
  
  // Allowed MIME types with their corresponding extensions and categories
  allowedTypes: {
    // Images
    'image/jpeg': { ext: ['jpg', 'jpeg'], category: 'image', maxSize: 25 * 1024 * 1024 },
    'image/png': { ext: ['png'], category: 'image', maxSize: 25 * 1024 * 1024 },
    'image/gif': { ext: ['gif'], category: 'image', maxSize: 15 * 1024 * 1024 },
    'image/webp': { ext: ['webp'], category: 'image', maxSize: 25 * 1024 * 1024 },
    'image/svg+xml': { ext: ['svg'], category: 'image', maxSize: 5 * 1024 * 1024 },
    
    // Documents
    'application/pdf': { ext: ['pdf'], category: 'document', maxSize: 100 * 1024 * 1024 },
    'application/msword': { ext: ['doc'], category: 'document', maxSize: 50 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: ['docx'], category: 'document', maxSize: 50 * 1024 * 1024 },
    'text/plain': { ext: ['txt'], category: 'document', maxSize: 10 * 1024 * 1024 },
    
    // Videos
    'video/mp4': { ext: ['mp4'], category: 'video', maxSize: 1024 * 1024 * 1024 },
    'video/avi': { ext: ['avi'], category: 'video', maxSize: 1024 * 1024 * 1024 },
    'video/quicktime': { ext: ['mov'], category: 'video', maxSize: 1024 * 1024 * 1024 },
    'video/x-msvideo': { ext: ['avi'], category: 'video', maxSize: 1024 * 1024 * 1024 },
    'video/webm': { ext: ['webm'], category: 'video', maxSize: 1024 * 1024 * 1024 },
    'video/x-matroska': { ext: ['mkv'], category: 'video', maxSize: 1024 * 1024 * 1024 },
    
    // Audio
    'audio/mpeg': { ext: ['mp3'], category: 'audio', maxSize: 100 * 1024 * 1024 },
    'audio/wav': { ext: ['wav'], category: 'audio', maxSize: 200 * 1024 * 1024 },
    'audio/mp4': { ext: ['m4a'], category: 'audio', maxSize: 100 * 1024 * 1024 },
    'audio/ogg': { ext: ['ogg'], category: 'audio', maxSize: 100 * 1024 * 1024 },
    'audio/flac': { ext: ['flac'], category: 'audio', maxSize: 200 * 1024 * 1024 },
    
    // Archives
    'application/zip': { ext: ['zip'], category: 'archive', maxSize: 200 * 1024 * 1024 },
    'application/x-rar-compressed': { ext: ['rar'], category: 'archive', maxSize: 200 * 1024 * 1024 },
    'application/x-7z-compressed': { ext: ['7z'], category: 'archive', maxSize: 200 * 1024 * 1024 },
    
    // Spreadsheets
    'application/vnd.ms-excel': { ext: ['xls'], category: 'spreadsheet', maxSize: 50 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: ['xlsx'], category: 'spreadsheet', maxSize: 50 * 1024 * 1024 },
    
    // Presentations
    'application/vnd.ms-powerpoint': { ext: ['ppt'], category: 'presentation', maxSize: 100 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: ['pptx'], category: 'presentation', maxSize: 100 * 1024 * 1024 }
  },
  
  // Dangerous file extensions to reject
  dangerousExtensions: [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
    'app', 'deb', 'pkg', 'rpm', 'dmg', 'iso', 'msi', 'run'
  ],
  
  // File name patterns to reject
  suspiciousPatterns: [
    /[<>:"|?*]/,  // Invalid filename characters
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Reserved Windows names
    /\.(php|asp|jsp|py|pl|rb|sh|bat|cmd)$/i  // Server-side script extensions
  ]
};

/**
 * Validate file type and extension
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
export const validateFileType = (file) => {
  try {
    const { originalname, mimetype, size } = file;
    const fileExt = path.extname(originalname).toLowerCase().slice(1);
    
    // Check if MIME type is allowed
    const typeConfig = VALIDATION_CONFIG.allowedTypes[mimetype];
    if (!typeConfig) {
      return {
        isValid: false,
        error: `File type "${mimetype}" is not supported`,
        code: 'INVALID_TYPE'
      };
    }
    
    // Check if extension matches MIME type
    if (!typeConfig.ext.includes(fileExt)) {
      return {
        isValid: false,
        error: `File extension "${fileExt}" does not match MIME type "${mimetype}"`,
        code: 'EXTENSION_MISMATCH'
      };
    }
    
    // Check file size against type-specific limit
    if (size > typeConfig.maxSize) {
      return {
        isValid: false,
        error: `File size ${formatFileSize(size)} exceeds maximum allowed size ${formatFileSize(typeConfig.maxSize)} for ${typeConfig.category} files`,
        code: 'SIZE_EXCEEDED'
      };
    }
    
    return {
      isValid: true,
      category: typeConfig.category,
      extension: fileExt,
      typeConfig
    };
  } catch (error) {
    return {
      isValid: false,
      error: `File type validation failed: ${error.message}`,
      code: 'VALIDATION_ERROR'
    };
  }
};

/**
 * Validate file name for security issues
 * @param {string} filename - Original filename
 * @returns {Object} Validation result
 */
export const validateFileName = (filename) => {
  try {
    // Check for dangerous extensions
    const fileExt = path.extname(filename).toLowerCase().slice(1);
    if (VALIDATION_CONFIG.dangerousExtensions.includes(fileExt)) {
      return {
        isValid: false,
        error: `File extension "${fileExt}" is not allowed for security reasons`,
        code: 'DANGEROUS_EXTENSION'
      };
    }
    
    // Check for suspicious patterns
    for (const pattern of VALIDATION_CONFIG.suspiciousPatterns) {
      if (pattern.test(filename)) {
        return {
          isValid: false,
          error: 'Filename contains invalid or suspicious characters',
          code: 'SUSPICIOUS_FILENAME'
        };
      }
    }
    
    // Check filename length
    if (filename.length > 255) {
      return {
        isValid: false,
        error: 'Filename is too long (maximum 255 characters)',
        code: 'FILENAME_TOO_LONG'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Filename validation failed: ${error.message}`,
      code: 'VALIDATION_ERROR'
    };
  }
};

/**
 * Extract file metadata
 * @param {Object} file - Multer file object
 * @returns {Object} File metadata
 */
export const extractFileMetadata = (file) => {
  try {
    const stats = fs.statSync(file.path);
    const hash = generateFileHash(file.path);
    
    return {
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadDate: new Date().toISOString(),
      lastModified: stats.mtime.toISOString(),
      hash: hash,
      path: file.path,
      fieldName: file.fieldname,
      encoding: file.encoding
    };
  } catch (error) {
    console.error('Metadata extraction failed:', error);
    return {
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadDate: new Date().toISOString(),
      error: error.message
    };
  }
};

/**
 * Generate file hash for duplicate detection
 * @param {string} filePath - Path to file
 * @returns {string} File hash
 */
export const generateFileHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error('Hash generation failed:', error);
    return null;
  }
};

/**
 * Simulate virus scanning (placeholder for real antivirus integration)
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Scan result
 */
export const simulateVirusScan = async (file) => {
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate virus detection for demo files
  const suspiciousNames = ['virus', 'malware', 'trojan', 'infected'];
  const isSuspicious = suspiciousNames.some(name => 
    file.originalname.toLowerCase().includes(name)
  );
  
  return {
    isClean: !isSuspicious,
    scanTime: new Date().toISOString(),
    scanner: 'FarmNex-AV-Simulator',
    version: '1.0.0',
    threat: isSuspicious ? 'Suspicious filename detected' : null
  };
};

/**
 * Comprehensive file validation
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Complete validation result
 */
export const validateFile = async (file) => {
  try {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: null,
      virusScan: null,
      typeValidation: null,
      nameValidation: null
    };
    
    // Validate file type
    const typeValidation = validateFileType(file);
    results.typeValidation = typeValidation;
    if (!typeValidation.isValid) {
      results.isValid = false;
      results.errors.push(typeValidation.error);
    }
    
    // Validate filename
    const nameValidation = validateFileName(file.originalname);
    results.nameValidation = nameValidation;
    if (!nameValidation.isValid) {
      results.isValid = false;
      results.errors.push(nameValidation.error);
    }
    
    // Extract metadata
    results.metadata = extractFileMetadata(file);
    
    // Perform virus scan
    const virusScan = await simulateVirusScan(file);
    results.virusScan = virusScan;
    if (!virusScan.isClean) {
      results.isValid = false;
      results.errors.push(`Security threat detected: ${virusScan.threat}`);
    }
    
    // Add warnings for large files
    if (file.size > 100 * 1024 * 1024) { // 100MB
      results.warnings.push('Large file detected - upload may take longer');
    }
    
    return results;
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed: ${error.message}`],
      warnings: [],
      metadata: null,
      virusScan: null,
      typeValidation: null,
      nameValidation: null
    };
  }
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Clean up uploaded file on validation failure
 * @param {Object} file - Multer file object
 */
export const cleanupFailedUpload = (file) => {
  try {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log(`Cleaned up failed upload: ${file.path}`);
    }
  } catch (error) {
    console.error('Failed to cleanup file:', error);
  }
};

/**
 * Check for duplicate files based on hash
 * @param {string} hash - File hash
 * @param {string} originalName - Original filename
 * @returns {Promise<Object>} Duplicate check result
 */
export const checkForDuplicates = async (hash, originalName) => {
  // This would typically check against a database
  // For now, return a placeholder
  return {
    isDuplicate: false,
    existingFile: null,
    message: null
  };
};

export default {
  validateFile,
  validateFileType,
  validateFileName,
  extractFileMetadata,
  generateFileHash,
  simulateVirusScan,
  cleanupFailedUpload,
  checkForDuplicates,
  VALIDATION_CONFIG
};