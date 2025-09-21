// Cloud storage utilities for training materials using Supabase
// Enhanced version of the existing media upload functionality

import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

// Supabase configuration
const SUPABASE_URL = "https://ombvnpeoietugpxelugs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYnZucGVvaWV0dWdweGVsdWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODM2ODYsImV4cCI6MjA2NzU1OTY4Nn0.mv9NsqrC2tckMmHa2w0X8Vg0fGtjsQXYYbMG1LRy9K4";

// Storage bucket configuration
const STORAGE_CONFIG = {
  bucket: 'training-materials',
  folder: 'public',
  // File size limits (in bytes)
  maxFileSize: 1024 * 1024 * 1024, // 1GB
  // Allowed file types
  allowedTypes: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain',
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upload a single file to Supabase storage
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result with URL and metadata
 */
export const uploadToCloud = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate file
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      // Check file size
      if (file.size > STORAGE_CONFIG.maxFileSize) {
        reject(new Error(`File size exceeds maximum limit of ${formatFileSize(STORAGE_CONFIG.maxFileSize)}`));
        return;
      }

      // Check file type
      if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
        reject(new Error(`File type "${file.type}" is not supported`));
        return;
      }

      // Generate unique filename
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substr(2, 9);
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${STORAGE_CONFIG.folder}/${fileName}`;

      // Upload options
      const uploadOptions = {
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false,
        ...options.metadata && { metadata: options.metadata }
      };

      // Perform upload
      supabase.storage
        .from(STORAGE_CONFIG.bucket)
        .upload(filePath, file, uploadOptions)
        .then((result) => {
          if (result.error) {
            console.error("Supabase upload error:", result.error);
            reject(new Error(`Upload failed: ${result.error.message}`));
            return;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(STORAGE_CONFIG.bucket)
            .getPublicUrl(filePath);

          if (!urlData?.publicUrl) {
            reject(new Error("Failed to get public URL"));
            return;
          }

          // Success - resolve with upload info
          resolve({
            success: true,
            url: urlData.publicUrl,
            path: filePath,
            fileName: fileName,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          });
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          reject(new Error(`Upload failed: ${error.message}`));
        });
    } catch (error) {
      console.error("Upload preparation error:", error);
      reject(new Error(`Upload preparation failed: ${error.message}`));
    }
  });
};

/**
 * Upload multiple files with progress tracking
 * @param {File[]} files - Array of files to upload
 * @param {Object} options - Upload options
 * @returns {Promise} Upload results for all files
 */
export const batchUploadToCloud = async (files, options = {}) => {
  const { onProgress, onFileComplete, onError } = options;
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Update progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          progress: ((i) / total) * 100,
          currentFile: file.name,
          stage: 'uploading'
        });
      }

      // Upload file
      const result = await uploadToCloud(file, options);
      results.push(result);

      // File complete callback
      if (onFileComplete) {
        onFileComplete({
          index: i,
          file,
          result,
          completed: i + 1,
          total
        });
      }

      // Update progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          progress: ((i + 1) / total) * 100,
          currentFile: file.name,
          stage: 'completed'
        });
      }

    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      
      const errorResult = {
        success: false,
        error: error.message,
        fileName: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type
      };
      
      results.push(errorResult);

      if (onError) {
        onError({
          index: i,
          file,
          error: error.message
        });
      }
    }
  }

  return {
    success: true,
    results,
    totalFiles: total,
    successfulUploads: results.filter(r => r.success).length,
    failedUploads: results.filter(r => !r.success).length
  };
};

/**
 * Delete a file from cloud storage
 * @param {string} filePath - Path of file to delete
 * @returns {Promise} Deletion result
 */
export const deleteFromCloud = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return {
      success: true,
      message: 'File deleted successfully',
      path: filePath
    };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error.message,
      path: filePath
    };
  }
};

/**
 * Get file metadata from cloud storage
 * @param {string} filePath - Path of file
 * @returns {Promise} File metadata
 */
export const getFileMetadata = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucket)
      .list(STORAGE_CONFIG.folder, {
        search: filePath.split('/').pop()
      });

    if (error) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }

    const fileData = data?.find(f => filePath.includes(f.name));
    
    return {
      success: true,
      metadata: fileData || null
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a signed URL for temporary access
 * @param {string} filePath - Path of file
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise} Signed URL
 */
export const createSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      expiresAt: new Date(Date.now() + (expiresIn * 1000)).toISOString()
    };
  } catch (error) {
    console.error("Signed URL error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check storage usage and limits
 * @returns {Promise} Storage statistics
 */
export const getStorageStats = async () => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucket)
      .list(STORAGE_CONFIG.folder, {
        limit: 1000, // Adjust based on your needs
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }

    const totalFiles = data?.length || 0;
    const totalSize = data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

    return {
      success: true,
      stats: {
        totalFiles,
        totalSize,
        formattedSize: formatFileSize(totalSize),
        files: data || []
      }
    };
  } catch (error) {
    console.error("Storage stats error:", error);
    return {
      success: false,
      error: error.message
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
 * Enhanced upload function with compression and cloud storage
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise} Enhanced upload result
 */
export const enhancedUpload = async (file, options = {}) => {
  try {
    let processedFile = file;

    // Apply compression if enabled (you can import from fileCompression.js)
    if (options.enableCompression && canCompress?.(file)) {
      try {
        const { autoCompress } = await import('./fileCompression.js');
        const compressedFile = await autoCompress(file, options.compressionOptions);
        if (compressedFile.size < file.size) {
          processedFile = compressedFile;
        }
      } catch (compressionError) {
        console.warn('Compression failed, using original file:', compressionError);
      }
    }

    // Upload to cloud storage
    const uploadResult = await uploadToCloud(processedFile, options);

    // Add compression info if file was compressed
    if (processedFile !== file) {
      uploadResult.compressed = true;
      uploadResult.originalSize = file.size;
      uploadResult.compressionRatio = Math.round(((file.size - processedFile.size) / file.size) * 100);
      uploadResult.sizeSaved = file.size - processedFile.size;
    }

    return uploadResult;
  } catch (error) {
    console.error('Enhanced upload error:', error);
    throw error;
  }
};

// Helper function to check if file can be compressed (basic version)
const canCompress = (file) => {
  return file.type.startsWith('image/') || file.type.startsWith('video/');
};

export default {
  uploadToCloud,
  batchUploadToCloud,
  deleteFromCloud,
  getFileMetadata,
  createSignedUrl,
  getStorageStats,
  enhancedUpload,
  STORAGE_CONFIG
};