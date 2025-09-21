// Chunked file upload utility for handling large files efficiently
// This utility splits large files into chunks and uploads them sequentially

/**
 * Configuration for chunked upload
 */
export const CHUNK_CONFIG = {
  // Default chunk size: 5MB
  DEFAULT_CHUNK_SIZE: 5 * 1024 * 1024,
  // Maximum number of retry attempts per chunk
  MAX_RETRIES: 3,
  // Delay between retry attempts (milliseconds)
  RETRY_DELAY: 1000,
  // Threshold file size to use chunked upload (25MB)
  CHUNKED_UPLOAD_THRESHOLD: 25 * 1024 * 1024,
};

/**
 * Split a file into chunks
 * @param {File} file - The file to split
 * @param {number} chunkSize - Size of each chunk in bytes
 * @returns {Array} Array of file chunks
 */
export const splitFileIntoChunks = (file, chunkSize = CHUNK_CONFIG.DEFAULT_CHUNK_SIZE) => {
  const chunks = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    chunks.push({
      chunk,
      index: chunks.length,
      start,
      end,
      size: end - start,
      isLast: end === file.size
    });
    
    start = end;
  }

  return chunks;
};

/**
 * Upload a single chunk with retry logic
 * @param {Object} chunkData - Chunk data object
 * @param {string} uploadUrl - Upload endpoint URL
 * @param {Object} metadata - File metadata
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} Upload promise
 */
const uploadChunk = async (chunkData, uploadUrl, metadata, onProgress) => {
  const { chunk, index, start, end, size, isLast } = chunkData;
  let retries = 0;

  while (retries <= CHUNK_CONFIG.MAX_RETRIES) {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', index);
      formData.append('chunkStart', start);
      formData.append('chunkEnd', end);
      formData.append('chunkSize', size);
      formData.append('isLastChunk', isLast);
      formData.append('totalSize', metadata.totalSize);
      formData.append('fileName', metadata.fileName);
      formData.append('fileType', metadata.fileType);
      formData.append('uploadId', metadata.uploadId);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      // Call progress callback
      if (onProgress) {
        onProgress({
          chunkIndex: index,
          chunkProgress: 100,
          uploaded: end,
          total: metadata.totalSize,
          overallProgress: (end / metadata.totalSize) * 100,
          speed: calculateUploadSpeed(start, end, Date.now() - metadata.startTime)
        });
      }

      return result;
    } catch (error) {
      retries++;
      
      if (retries > CHUNK_CONFIG.MAX_RETRIES) {
        throw new Error(`Failed to upload chunk ${index} after ${CHUNK_CONFIG.MAX_RETRIES} retries: ${error.message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, CHUNK_CONFIG.RETRY_DELAY * retries));
    }
  }
};

/**
 * Calculate upload speed in bytes per second
 * @param {number} start - Start byte position
 * @param {number} end - End byte position
 * @param {number} timeElapsed - Time elapsed in milliseconds
 * @returns {number} Upload speed in bytes/second
 */
const calculateUploadSpeed = (start, end, timeElapsed) => {
  const bytesUploaded = end - start;
  const timeInSeconds = timeElapsed / 1000;
  return timeInSeconds > 0 ? bytesUploaded / timeInSeconds : 0;
};

/**
 * Format upload speed for display
 * @param {number} bytesPerSecond - Speed in bytes per second
 * @returns {string} Formatted speed string
 */
export const formatUploadSpeed = (bytesPerSecond) => {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(1)} B/s`;
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
};

/**
 * Estimate time remaining for upload
 * @param {number} uploaded - Bytes uploaded so far
 * @param {number} total - Total bytes to upload
 * @param {number} speed - Current upload speed in bytes/second
 * @returns {string} Formatted time remaining
 */
export const estimateTimeRemaining = (uploaded, total, speed) => {
  if (speed <= 0 || uploaded >= total) return 'Calculating...';
  
  const remaining = total - uploaded;
  const secondsRemaining = remaining / speed;
  
  if (secondsRemaining < 60) return `${Math.ceil(secondsRemaining)}s`;
  if (secondsRemaining < 3600) return `${Math.ceil(secondsRemaining / 60)}m`;
  return `${Math.ceil(secondsRemaining / 3600)}h`;
};

/**
 * Generate a unique upload ID
 * @returns {string} Unique upload identifier
 */
export const generateUploadId = () => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Main chunked upload function
 * @param {File} file - File to upload
 * @param {string} uploadUrl - Upload endpoint URL
 * @param {Object} options - Upload options
 * @returns {Promise} Upload promise with progress tracking
 */
export const chunkedUpload = async (file, uploadUrl, options = {}) => {
  const {
    chunkSize = CHUNK_CONFIG.DEFAULT_CHUNK_SIZE,
    onProgress,
    onChunkComplete,
    onError,
    signal // AbortController signal for cancellation
  } = options;

  // Check if file should use chunked upload
  if (file.size < CHUNK_CONFIG.CHUNKED_UPLOAD_THRESHOLD) {
    throw new Error('File is too small for chunked upload. Use regular upload instead.');
  }

  const uploadId = generateUploadId();
  const metadata = {
    uploadId,
    fileName: file.name,
    fileType: file.type,
    totalSize: file.size,
    startTime: Date.now()
  };

  const chunks = splitFileIntoChunks(file, chunkSize);
  const uploadResults = [];

  try {
    // Upload chunks sequentially to maintain order
    for (const chunkData of chunks) {
      // Check if upload was cancelled
      if (signal && signal.aborted) {
        throw new Error('Upload cancelled by user');
      }

      try {
        const result = await uploadChunk(chunkData, uploadUrl, metadata, onProgress);
        uploadResults.push(result);

        if (onChunkComplete) {
          onChunkComplete({
            chunkIndex: chunkData.index,
            totalChunks: chunks.length,
            result
          });
        }
      } catch (error) {
        if (onError) {
          onError({
            chunkIndex: chunkData.index,
            error: error.message
          });
        }
        throw error;
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        chunkIndex: chunks.length - 1,
        chunkProgress: 100,
        uploaded: file.size,
        total: file.size,
        overallProgress: 100,
        speed: calculateUploadSpeed(0, file.size, Date.now() - metadata.startTime),
        completed: true
      });
    }

    return {
      success: true,
      uploadId,
      results: uploadResults,
      finalResult: uploadResults[uploadResults.length - 1] // Last chunk response contains final file info
    };

  } catch (error) {
    throw new Error(`Chunked upload failed: ${error.message}`);
  }
};

/**
 * Regular upload for small files
 * @param {File} file - File to upload
 * @param {string} uploadUrl - Upload endpoint URL
 * @param {Object} options - Upload options
 * @returns {Promise} Upload promise
 */
export const regularUpload = async (file, uploadUrl, options = {}) => {
  const { onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Add authorization header
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Handle upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress({
          uploaded: e.loaded,
          total: e.total,
          overallProgress: progress,
          speed: calculateUploadSpeed(0, e.loaded, Date.now() - startTime)
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            result
          });
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    // Handle cancellation
    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled by user'));
      });
    }

    const startTime = Date.now();
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
};

/**
 * Smart upload function that chooses between regular and chunked upload
 * @param {File} file - File to upload
 * @param {string} uploadUrl - Upload endpoint URL
 * @param {Object} options - Upload options
 * @returns {Promise} Upload promise
 */
export const smartUpload = async (file, uploadUrl, options = {}) => {
  if (file.size >= CHUNK_CONFIG.CHUNKED_UPLOAD_THRESHOLD) {
    return chunkedUpload(file, uploadUrl, options);
  } else {
    return regularUpload(file, uploadUrl, options);
  }
};

export default {
  chunkedUpload,
  regularUpload,
  smartUpload,
  splitFileIntoChunks,
  generateUploadId,
  formatUploadSpeed,
  estimateTimeRemaining,
  CHUNK_CONFIG
};