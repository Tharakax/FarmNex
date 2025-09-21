// Resumable upload utility for handling interrupted uploads
// Stores upload progress in localStorage and allows resuming

import { CHUNK_CONFIG } from './chunkedUpload.js';

// Configuration for resumable uploads
const RESUMABLE_CONFIG = {
  // Storage key prefix for localStorage
  STORAGE_KEY_PREFIX: 'farmnex_upload_',
  // Maximum age of stored upload info (24 hours)
  MAX_STORAGE_AGE: 24 * 60 * 60 * 1000,
  // Chunk size for resumable uploads
  CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
};

/**
 * Upload session data structure stored in localStorage
 */
class UploadSession {
  constructor(file, uploadId) {
    this.uploadId = uploadId;
    this.fileName = file.name;
    this.fileSize = file.size;
    this.fileType = file.type;
    this.lastModified = file.lastModified;
    this.chunks = [];
    this.completedChunks = [];
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
    this.status = 'pending'; // pending, uploading, paused, completed, failed
    this.totalChunks = Math.ceil(file.size / RESUMABLE_CONFIG.CHUNK_SIZE);
  }

  markChunkComplete(chunkIndex, chunkResult) {
    if (!this.completedChunks.includes(chunkIndex)) {
      this.completedChunks.push(chunkIndex);
    }
    this.lastActivityAt = Date.now();
    this.progress = (this.completedChunks.length / this.totalChunks) * 100;
  }

  isComplete() {
    return this.completedChunks.length === this.totalChunks;
  }

  getRemainingChunks() {
    const allChunks = Array.from({ length: this.totalChunks }, (_, i) => i);
    return allChunks.filter(i => !this.completedChunks.includes(i));
  }

  toJSON() {
    return {
      uploadId: this.uploadId,
      fileName: this.fileName,
      fileSize: this.fileSize,
      fileType: this.fileType,
      lastModified: this.lastModified,
      chunks: this.chunks,
      completedChunks: this.completedChunks,
      createdAt: this.createdAt,
      lastActivityAt: this.lastActivityAt,
      status: this.status,
      totalChunks: this.totalChunks,
      progress: this.progress || 0
    };
  }

  static fromJSON(data) {
    const session = new UploadSession({ 
      name: data.fileName, 
      size: data.fileSize, 
      type: data.fileType,
      lastModified: data.lastModified 
    }, data.uploadId);
    
    Object.assign(session, data);
    return session;
  }
}

/**
 * Generate a unique upload ID
 * @returns {string} Unique upload ID
 */
export const generateUploadId = () => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Store upload session in localStorage
 * @param {UploadSession} session - Upload session to store
 */
export const storeUploadSession = (session) => {
  try {
    const key = `${RESUMABLE_CONFIG.STORAGE_KEY_PREFIX}${session.uploadId}`;
    localStorage.setItem(key, JSON.stringify(session.toJSON()));
  } catch (error) {
    console.error('Failed to store upload session:', error);
  }
};

/**
 * Retrieve upload session from localStorage
 * @param {string} uploadId - Upload ID to retrieve
 * @returns {UploadSession|null} Upload session or null if not found
 */
export const getUploadSession = (uploadId) => {
  try {
    const key = `${RESUMABLE_CONFIG.STORAGE_KEY_PREFIX}${uploadId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    const sessionData = JSON.parse(data);
    
    // Check if session is expired
    const age = Date.now() - sessionData.createdAt;
    if (age > RESUMABLE_CONFIG.MAX_STORAGE_AGE) {
      removeUploadSession(uploadId);
      return null;
    }
    
    return UploadSession.fromJSON(sessionData);
  } catch (error) {
    console.error('Failed to retrieve upload session:', error);
    return null;
  }
};

/**
 * Remove upload session from localStorage
 * @param {string} uploadId - Upload ID to remove
 */
export const removeUploadSession = (uploadId) => {
  try {
    const key = `${RESUMABLE_CONFIG.STORAGE_KEY_PREFIX}${uploadId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove upload session:', error);
  }
};

/**
 * Get all stored upload sessions
 * @returns {UploadSession[]} Array of upload sessions
 */
export const getAllUploadSessions = () => {
  const sessions = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(RESUMABLE_CONFIG.STORAGE_KEY_PREFIX)) {
        const uploadId = key.replace(RESUMABLE_CONFIG.STORAGE_KEY_PREFIX, '');
        const session = getUploadSession(uploadId);
        
        if (session) {
          sessions.push(session);
        }
      }
    }
  } catch (error) {
    console.error('Failed to get upload sessions:', error);
  }
  
  return sessions;
};

/**
 * Clean up expired upload sessions
 */
export const cleanupExpiredSessions = () => {
  try {
    const sessions = getAllUploadSessions();
    const now = Date.now();
    
    sessions.forEach(session => {
      const age = now - session.createdAt;
      if (age > RESUMABLE_CONFIG.MAX_STORAGE_AGE) {
        removeUploadSession(session.uploadId);
      }
    });
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
};

/**
 * Split file into chunks for resumable upload
 * @param {File} file - File to split
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of chunk objects
 */
export const splitIntoResumableChunks = (file, chunkSize = RESUMABLE_CONFIG.CHUNK_SIZE) => {
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    
    chunks.push({
      index: chunkIndex,
      start,
      end,
      size: end - start,
      blob: file.slice(start, end)
    });
    
    start = end;
    chunkIndex++;
  }

  return chunks;
};

/**
 * Upload a single chunk with retry logic
 * @param {Object} chunk - Chunk object
 * @param {string} uploadUrl - Upload endpoint
 * @param {UploadSession} session - Upload session
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result
 */
const uploadChunk = async (chunk, uploadUrl, session, options = {}) => {
  const { onProgress, signal, maxRetries = 3 } = options;
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk.blob);
      formData.append('chunkIndex', chunk.index);
      formData.append('uploadId', session.uploadId);
      formData.append('fileName', session.fileName);
      formData.append('fileSize', session.fileSize);
      formData.append('fileType', session.fileType);
      formData.append('totalChunks', session.totalChunks);
      formData.append('chunkStart', chunk.start);
      formData.append('chunkEnd', chunk.end);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Update progress
      if (onProgress) {
        onProgress({
          chunkIndex: chunk.index,
          totalChunks: session.totalChunks,
          progress: ((chunk.index + 1) / session.totalChunks) * 100,
          uploaded: chunk.end,
          total: session.fileSize
        });
      }

      return result;
    } catch (error) {
      retries++;
      
      if (retries > maxRetries) {
        throw new Error(`Failed to upload chunk ${chunk.index} after ${maxRetries} retries: ${error.message}`);
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Start or resume a resumable upload
 * @param {File} file - File to upload
 * @param {string} uploadUrl - Upload endpoint
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result
 */
export const resumableUpload = async (file, uploadUrl, options = {}) => {
  const {
    uploadId: existingUploadId,
    onProgress,
    onChunkComplete,
    onError,
    signal
  } = options;

  // Generate or use existing upload ID
  const uploadId = existingUploadId || generateUploadId();
  
  // Try to get existing session
  let session = getUploadSession(uploadId);
  
  // Create new session if none exists or file doesn't match
  if (!session || session.fileName !== file.name || session.fileSize !== file.size) {
    session = new UploadSession(file, uploadId);
    session.status = 'uploading';
    storeUploadSession(session);
  }

  try {
    // Split file into chunks
    const chunks = splitIntoResumableChunks(file);
    
    // Get remaining chunks to upload
    const remainingChunks = chunks.filter(chunk => 
      !session.completedChunks.includes(chunk.index)
    );

    if (remainingChunks.length === 0) {
      // Upload is already complete
      session.status = 'completed';
      storeUploadSession(session);
      
      if (onProgress) {
        onProgress({
          progress: 100,
          uploaded: file.size,
          total: file.size,
          completed: true
        });
      }
      
      return {
        success: true,
        uploadId,
        resumed: true,
        message: 'Upload already completed'
      };
    }

    // Upload remaining chunks
    const results = [];
    
    for (const chunk of remainingChunks) {
      // Check if upload was cancelled
      if (signal && signal.aborted) {
        session.status = 'paused';
        storeUploadSession(session);
        throw new Error('Upload cancelled by user');
      }

      try {
        const result = await uploadChunk(chunk, uploadUrl, session, {
          onProgress,
          signal
        });
        
        results.push(result);
        session.markChunkComplete(chunk.index, result);
        storeUploadSession(session);

        if (onChunkComplete) {
          onChunkComplete({
            chunkIndex: chunk.index,
            totalChunks: session.totalChunks,
            result,
            progress: session.progress
          });
        }

      } catch (error) {
        session.status = 'failed';
        storeUploadSession(session);
        
        if (onError) {
          onError({
            chunkIndex: chunk.index,
            error: error.message,
            canResume: true
          });
        }
        
        throw error;
      }
    }

    // Upload completed successfully
    session.status = 'completed';
    storeUploadSession(session);

    // Final progress update
    if (onProgress) {
      onProgress({
        progress: 100,
        uploaded: file.size,
        total: file.size,
        completed: true
      });
    }

    return {
      success: true,
      uploadId,
      results,
      finalResult: results[results.length - 1],
      resumed: existingUploadId ? true : false
    };

  } catch (error) {
    session.status = 'failed';
    storeUploadSession(session);
    throw error;
  }
};

/**
 * Cancel a resumable upload
 * @param {string} uploadId - Upload ID to cancel
 * @returns {boolean} Success status
 */
export const cancelResumableUpload = (uploadId) => {
  try {
    const session = getUploadSession(uploadId);
    if (session) {
      session.status = 'paused';
      storeUploadSession(session);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to cancel upload:', error);
    return false;
  }
};

/**
 * Get upload progress information
 * @param {string} uploadId - Upload ID
 * @returns {Object|null} Progress information
 */
export const getUploadProgress = (uploadId) => {
  try {
    const session = getUploadSession(uploadId);
    if (!session) return null;

    return {
      uploadId: session.uploadId,
      fileName: session.fileName,
      fileSize: session.fileSize,
      progress: session.progress || 0,
      status: session.status,
      completedChunks: session.completedChunks.length,
      totalChunks: session.totalChunks,
      canResume: session.status === 'paused' || session.status === 'failed',
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt
    };
  } catch (error) {
    console.error('Failed to get upload progress:', error);
    return null;
  }
};

/**
 * Check if an upload can be resumed
 * @param {File} file - File to check
 * @returns {string|null} Upload ID if resumable, null otherwise
 */
export const findResumableUpload = (file) => {
  try {
    const sessions = getAllUploadSessions();
    
    const matchingSession = sessions.find(session => 
      session.fileName === file.name &&
      session.fileSize === file.size &&
      session.lastModified === file.lastModified &&
      (session.status === 'paused' || session.status === 'failed') &&
      !session.isComplete()
    );

    return matchingSession ? matchingSession.uploadId : null;
  } catch (error) {
    console.error('Failed to find resumable upload:', error);
    return null;
  }
};

// Initialize cleanup on module load
cleanupExpiredSessions();

export default {
  resumableUpload,
  cancelResumableUpload,
  getUploadProgress,
  findResumableUpload,
  getAllUploadSessions,
  cleanupExpiredSessions,
  generateUploadId,
  RESUMABLE_CONFIG
};