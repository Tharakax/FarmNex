// File compression utilities for reducing file sizes before upload
// Handles image and video compression while maintaining acceptable quality

/**
 * Configuration for file compression
 */
export const COMPRESSION_CONFIG = {
  // Image compression settings
  image: {
    // Maximum dimensions for compressed images
    maxWidth: 1920,
    maxHeight: 1080,
    // JPEG quality (0-1, where 1 is best quality)
    quality: 0.85,
    // Convert formats to optimize file size
    convertToJPEG: true,
    // Threshold size to trigger compression (5MB)
    compressionThreshold: 5 * 1024 * 1024,
  },
  
  // Video compression settings (basic client-side options)
  video: {
    // Maximum dimensions for compressed videos
    maxWidth: 1280,
    maxHeight: 720,
    // Compression quality
    quality: 0.8,
    // Threshold size to trigger compression (50MB)
    compressionThreshold: 50 * 1024 * 1024,
  }
};

/**
 * Compress an image file
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = COMPRESSION_CONFIG.image.maxWidth,
      maxHeight = COMPRESSION_CONFIG.image.maxHeight,
      quality = COMPRESSION_CONFIG.image.quality,
      convertToJPEG = COMPRESSION_CONFIG.image.convertToJPEG
    } = options;

    // Check if compression is needed
    if (file.size < COMPRESSION_CONFIG.image.compressionThreshold) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        const outputFormat = convertToJPEG && file.type !== 'image/png' ? 'image/jpeg' : file.type;
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              generateCompressedFileName(file.name, outputFormat),
              {
                type: outputFormat,
                lastModified: Date.now()
              }
            );

            // Only use compressed version if it's actually smaller
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          outputFormat,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Load image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate optimal dimensions maintaining aspect ratio
 * @param {number} originalWidth - Original width
 * @param {number} originalHeight - Original height
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Object} New dimensions
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let width = originalWidth;
  let height = originalHeight;

  // Calculate aspect ratio
  const aspectRatio = width / height;

  // Resize if width exceeds maximum
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // Resize if height exceeds maximum
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Generate filename for compressed file
 * @param {string} originalName - Original filename
 * @param {string} newFormat - New MIME type
 * @returns {string} New filename
 */
const generateCompressedFileName = (originalName, newFormat) => {
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  const extension = newFormat.split('/')[1];
  return `${nameWithoutExt}_compressed.${extension}`;
};

/**
 * Basic video compression using HTML5 video element
 * Note: This is limited client-side compression. For production,
 * consider server-side or dedicated video compression services.
 * @param {File} file - Video file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed video file
 */
export const compressVideo = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if compression is needed
    if (file.size < COMPRESSION_CONFIG.video.compressionThreshold) {
      resolve(file);
      return;
    }

    // For now, we'll return the original file as client-side video compression
    // is complex and limited. In production, this should be handled server-side
    // or using dedicated video compression libraries/services.
    console.warn('Video compression is not fully implemented client-side. Consider server-side compression.');
    resolve(file);
  });
};

/**
 * Auto-detect file type and apply appropriate compression
 * @param {File} file - File to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed file or original if compression not applicable
 */
export const autoCompress = async (file, options = {}) => {
  try {
    // Check if file is an image
    if (file.type.startsWith('image/')) {
      return await compressImage(file, options.image || {});
    }
    
    // Check if file is a video
    if (file.type.startsWith('video/')) {
      return await compressVideo(file, options.video || {});
    }
    
    // Return original file if no compression is available
    return file;
  } catch (error) {
    console.error('Compression failed:', error);
    // Return original file if compression fails
    return file;
  }
};

/**
 * Calculate compression ratio
 * @param {number} originalSize - Original file size
 * @param {number} compressedSize - Compressed file size
 * @returns {number} Compression ratio as percentage
 */
export const calculateCompressionRatio = (originalSize, compressedSize) => {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};

/**
 * Format compression results for display
 * @param {File} originalFile - Original file
 * @param {File} compressedFile - Compressed file
 * @returns {Object} Compression results
 */
export const formatCompressionResults = (originalFile, compressedFile) => {
  const originalSize = originalFile.size;
  const compressedSize = compressedFile.size;
  const ratio = calculateCompressionRatio(originalSize, compressedSize);
  
  return {
    originalSize,
    compressedSize,
    ratio,
    sizeSaved: originalSize - compressedSize,
    isCompressed: compressedSize < originalSize,
    originalName: originalFile.name,
    compressedName: compressedFile.name
  };
};

/**
 * Batch compress multiple files
 * @param {File[]} files - Array of files to compress
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of compressed files
 */
export const batchCompress = async (files, options = {}, onProgress = null) => {
  const compressedFiles = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];
      const compressedFile = await autoCompress(file, options);
      compressedFiles.push(compressedFile);
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          progress: ((i + 1) / total) * 100,
          currentFile: file.name,
          results: formatCompressionResults(file, compressedFile)
        });
      }
    } catch (error) {
      console.error(`Failed to compress file ${files[i].name}:`, error);
      compressedFiles.push(files[i]); // Use original file on error
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          progress: ((i + 1) / total) * 100,
          currentFile: files[i].name,
          error: error.message
        });
      }
    }
  }
  
  return compressedFiles;
};

/**
 * Check if file can be compressed
 * @param {File} file - File to check
 * @returns {boolean} True if file can be compressed
 */
export const canCompress = (file) => {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
};

/**
 * Get estimated compression savings
 * @param {File} file - File to analyze
 * @returns {Object} Estimated compression results
 */
export const estimateCompression = (file) => {
  if (!canCompress(file)) {
    return {
      canCompress: false,
      estimatedSavings: 0,
      estimatedSize: file.size
    };
  }

  let estimatedCompressionRatio = 0;
  
  if (file.type.startsWith('image/')) {
    // Images typically compress by 30-70% depending on format and quality
    estimatedCompressionRatio = file.size > COMPRESSION_CONFIG.image.compressionThreshold ? 0.5 : 0;
  } else if (file.type.startsWith('video/')) {
    // Videos can compress significantly but it's harder to estimate
    estimatedCompressionRatio = file.size > COMPRESSION_CONFIG.video.compressionThreshold ? 0.3 : 0;
  }

  const estimatedSize = Math.round(file.size * (1 - estimatedCompressionRatio));
  const estimatedSavings = file.size - estimatedSize;

  return {
    canCompress: true,
    estimatedSavings,
    estimatedSize,
    estimatedRatio: Math.round(estimatedCompressionRatio * 100)
  };
};

export default {
  compressImage,
  compressVideo,
  autoCompress,
  batchCompress,
  canCompress,
  estimateCompression,
  calculateCompressionRatio,
  formatCompressionResults,
  COMPRESSION_CONFIG
};