// File management utilities for training materials

/**
 * Allowed file types for training materials
 */
export const ALLOWED_FILE_TYPES = {
  // Documents (increased limits for training materials)
  'application/pdf': { ext: 'pdf', category: 'document', maxSize: 100 * 1024 * 1024 }, // 100MB
  'application/msword': { ext: 'doc', category: 'document', maxSize: 50 * 1024 * 1024 }, // 50MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', category: 'document', maxSize: 50 * 1024 * 1024 }, // 50MB
  'text/plain': { ext: 'txt', category: 'document', maxSize: 10 * 1024 * 1024 }, // 10MB
  
  // Images (increased limits for high-quality training materials)
  'image/jpeg': { ext: 'jpg', category: 'image', maxSize: 25 * 1024 * 1024 }, // 25MB
  'image/jpg': { ext: 'jpg', category: 'image', maxSize: 25 * 1024 * 1024 }, // 25MB
  'image/png': { ext: 'png', category: 'image', maxSize: 25 * 1024 * 1024 }, // 25MB
  'image/gif': { ext: 'gif', category: 'image', maxSize: 15 * 1024 * 1024 }, // 15MB
  'image/webp': { ext: 'webp', category: 'image', maxSize: 25 * 1024 * 1024 }, // 25MB
  'image/svg+xml': { ext: 'svg', category: 'image', maxSize: 5 * 1024 * 1024 }, // 5MB
  
  // Videos (increased limits for training videos)
  'video/mp4': { ext: 'mp4', category: 'video', maxSize: 1024 * 1024 * 1024 }, // 1GB
  'video/avi': { ext: 'avi', category: 'video', maxSize: 1024 * 1024 * 1024 }, // 1GB
  'video/quicktime': { ext: 'mov', category: 'video', maxSize: 1024 * 1024 * 1024 }, // 1GB
  'video/x-msvideo': { ext: 'avi', category: 'video', maxSize: 1024 * 1024 * 1024 }, // 1GB
  'video/webm': { ext: 'webm', category: 'video', maxSize: 1024 * 1024 * 1024 }, // 1GB
  'video/x-matroska': { ext: 'mkv', category: 'video', maxSize: 1024 * 1024 * 1024 }, // 1GB
  
  // Audio (increased limits for training audio materials)
  'audio/mpeg': { ext: 'mp3', category: 'audio', maxSize: 100 * 1024 * 1024 }, // 100MB
  'audio/wav': { ext: 'wav', category: 'audio', maxSize: 200 * 1024 * 1024 }, // 200MB
  'audio/mp4': { ext: 'm4a', category: 'audio', maxSize: 100 * 1024 * 1024 }, // 100MB
  'audio/ogg': { ext: 'ogg', category: 'audio', maxSize: 100 * 1024 * 1024 }, // 100MB
  'audio/flac': { ext: 'flac', category: 'audio', maxSize: 200 * 1024 * 1024 }, // 200MB
  
  // Archives (for training material packages)
  'application/zip': { ext: 'zip', category: 'archive', maxSize: 200 * 1024 * 1024 }, // 200MB
  'application/x-rar-compressed': { ext: 'rar', category: 'archive', maxSize: 200 * 1024 * 1024 }, // 200MB
  'application/x-7z-compressed': { ext: '7z', category: 'archive', maxSize: 200 * 1024 * 1024 }, // 200MB
  
  // Spreadsheets (increased limits for data-heavy training materials)
  'application/vnd.ms-excel': { ext: 'xls', category: 'spreadsheet', maxSize: 50 * 1024 * 1024 }, // 50MB
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', category: 'spreadsheet', maxSize: 50 * 1024 * 1024 }, // 50MB
  
  // Presentations (for training presentations)
  'application/vnd.ms-powerpoint': { ext: 'ppt', category: 'presentation', maxSize: 100 * 1024 * 1024 }, // 100MB
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', category: 'presentation', maxSize: 100 * 1024 * 1024 } // 100MB
};

/**
 * Validate a file against allowed types and size limits
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid boolean and error message
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  const fileType = ALLOWED_FILE_TYPES[file.type];
  
  if (!fileType) {
    return { 
      isValid: false, 
      error: `File type "${file.type}" is not supported. Please upload PDF, DOC, DOCX, TXT, images, videos, or audio files.`
    };
  }

  if (file.size > fileType.maxSize) {
    return { 
      isValid: false, 
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(fileType.maxSize)}) for ${fileType.ext.toUpperCase()} files.`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file category and extension from file type
 * @param {string} fileType - MIME type of the file
 * @returns {Object} - File info with category and extension
 */
export const getFileInfo = (fileType) => {
  const info = ALLOWED_FILE_TYPES[fileType];
  return info ? { category: info.category, ext: info.ext } : { category: 'unknown', ext: 'unknown' };
};

/**
 * Generate a unique file ID
 * @returns {string} - Unique file identifier
 */
export const generateFileId = () => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a file object for storage
 * @param {File} file - The original file
 * @param {string} uploadUrl - URL where the file was uploaded (mock)
 * @returns {Object} - File object for storage
 */
export const createFileObject = (file, uploadUrl = null) => {
  const fileInfo = getFileInfo(file.type);
  
  return {
    id: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    category: fileInfo.category,
    extension: fileInfo.ext,
    url: uploadUrl || `#${file.name}`, // Mock URL
    uploadedAt: new Date().toISOString(),
    lastModified: new Date(file.lastModified).toISOString()
  };
};

/**
 * Simulate file upload with progress
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback (progress: number 0-100)
 * @returns {Promise} - Promise that resolves with upload result
 */
export const simulateFileUpload = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    let progress = 0;
    const increment = Math.random() * 15 + 5; // Random increment between 5-20
    
    const interval = setInterval(() => {
      progress += increment;
      
      if (progress >= 100) {
        progress = 100;
        onProgress(progress);
        clearInterval(interval);
        
        // Simulate successful upload
        const fileObject = createFileObject(file, `https://example.com/files/${generateFileId()}.${getFileInfo(file.type).ext}`);
        resolve(fileObject);
      } else {
        onProgress(progress);
      }
    }, 200 + Math.random() * 300); // Random delay between 200-500ms
  });
};

/**
 * Get file icon based on file category
 * @param {string} category - File category
 * @returns {string} - Icon name for Lucide React
 */
export const getFileIcon = (category) => {
  switch (category) {
    case 'document':
      return 'FileText';
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Mic';
    case 'archive':
      return 'Archive';
    case 'spreadsheet':
      return 'Sheet';
    case 'presentation':
      return 'Presentation';
    default:
      return 'File';
  }
};

/**
 * Check if a file is an image that can be previewed
 * @param {string} fileType - MIME type of the file
 * @returns {boolean} - True if file can be previewed as image
 */
export const isImagePreviewable = (fileType) => {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(fileType);
};

/**
 * Create a preview URL for a file (for images)
 * @param {File} file - The file to create preview for
 * @returns {string|null} - Preview URL or null if not previewable
 */
export const createPreviewUrl = (file) => {
  if (isImagePreviewable(file.type)) {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Clean up preview URLs to prevent memory leaks
 * @param {string} url - URL to revoke
 */
export const revokePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
