// Video file validation utility for large video uploads
// Provides specialized validation and handling for video files

/**
 * Configuration for video validation
 */
export const VIDEO_CONFIG = {
  // Maximum video file size (500MB)
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,
  
  // Recommended video file size (100MB)
  RECOMMENDED_VIDEO_SIZE: 100 * 1024 * 1024,
  
  // Supported video formats
  SUPPORTED_FORMATS: [
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/wmv'
  ],
  
  // Recommended formats for best compatibility
  RECOMMENDED_FORMATS: [
    'video/mp4',
    'video/webm'
  ],
  
  // Maximum duration in seconds (30 minutes)
  MAX_DURATION: 30 * 60
};

/**
 * Validate video file size and format
 * @param {File} file - Video file to validate
 * @returns {Object} Validation result
 */
export const validateVideoFile = (file) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: []
  };

  // Check file type
  if (!VIDEO_CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
    result.isValid = false;
    result.errors.push(
      `Video format "${file.type}" is not supported. ` +
      `Supported formats: ${VIDEO_CONFIG.SUPPORTED_FORMATS.map(f => f.split('/')[1]).join(', ')}`
    );
    return result;
  }

  // Check file size
  if (file.size > VIDEO_CONFIG.MAX_VIDEO_SIZE) {
    result.isValid = false;
    result.errors.push(
      `Video file is too large (${formatFileSize(file.size)}). ` +
      `Maximum size allowed: ${formatFileSize(VIDEO_CONFIG.MAX_VIDEO_SIZE)}`
    );
    return result;
  }

  // Add size warnings and recommendations
  if (file.size > VIDEO_CONFIG.RECOMMENDED_VIDEO_SIZE) {
    result.warnings.push(
      `Large video file detected (${formatFileSize(file.size)}). ` +
      `Upload may take longer. Consider compressing to under ${formatFileSize(VIDEO_CONFIG.RECOMMENDED_VIDEO_SIZE)} for faster uploads.`
    );
    result.recommendations.push('Consider compressing the video to reduce upload time and storage usage.');
  }

  // Format recommendations
  if (!VIDEO_CONFIG.RECOMMENDED_FORMATS.includes(file.type)) {
    result.recommendations.push(
      `For best compatibility, consider converting to MP4 or WebM format. ` +
      `Current format: ${file.type.split('/')[1].toUpperCase()}`
    );
  }

  return result;
};

/**
 * Get video metadata (requires HTML5 video element)
 * @param {File} file - Video file
 * @returns {Promise<Object>} Video metadata
 */
export const getVideoMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.preload = 'metadata';
    video.onloadedmetadata = function() {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight,
        size: file.size,
        type: file.type,
        name: file.name
      };
      
      // Clean up object URL
      URL.revokeObjectURL(url);
      resolve(metadata);
    };
    
    video.onerror = function() {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = url;
  });
};

/**
 * Validate video metadata
 * @param {Object} metadata - Video metadata from getVideoMetadata
 * @returns {Object} Validation result
 */
export const validateVideoMetadata = (metadata) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    info: []
  };

  // Check duration
  if (metadata.duration > VIDEO_CONFIG.MAX_DURATION) {
    result.warnings.push(
      `Video is quite long (${formatDuration(metadata.duration)}). ` +
      `Consider splitting into shorter segments for better user experience.`
    );
  }

  // Resolution recommendations
  if (metadata.width && metadata.height) {
    result.info.push(`Resolution: ${metadata.width}×${metadata.height}`);
    
    if (metadata.width > 1920 || metadata.height > 1080) {
      result.warnings.push(
        'High resolution video detected. Consider compressing to 1080p or lower for better upload performance.'
      );
    }
  }

  // Duration info
  if (metadata.duration) {
    result.info.push(`Duration: ${formatDuration(metadata.duration)}`);
  }

  // Bitrate estimation
  if (metadata.duration > 0) {
    const estimatedBitrate = (metadata.size * 8) / metadata.duration; // bits per second
    const bitrateMbps = estimatedBitrate / (1024 * 1024); // Mbps
    
    result.info.push(`Estimated bitrate: ${bitrateMbps.toFixed(1)} Mbps`);
    
    if (bitrateMbps > 10) {
      result.warnings.push(
        'High bitrate detected. Consider compressing the video to reduce file size and upload time.'
      );
    }
  }

  return result;
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
 * Format duration in human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get upload time estimate for video
 * @param {number} fileSize - File size in bytes
 * @param {number} connectionSpeed - Connection speed in Mbps (default: 10)
 * @returns {Object} Time estimates
 */
export const getVideoUploadEstimate = (fileSize, connectionSpeed = 10) => {
  // Convert connection speed to bytes per second
  const bytesPerSecond = (connectionSpeed * 1024 * 1024) / 8;
  
  // Calculate time in seconds
  const timeSeconds = fileSize / bytesPerSecond;
  
  // Add overhead for processing and network delays (30% extra)
  const timeWithOverhead = timeSeconds * 1.3;
  
  return {
    optimistic: formatDuration(timeSeconds),
    realistic: formatDuration(timeWithOverhead),
    pessimistic: formatDuration(timeWithOverhead * 1.5),
    connectionSpeed: `${connectionSpeed} Mbps`,
    fileSize: formatFileSize(fileSize)
  };
};

/**
 * Get video compression recommendations
 * @param {Object} metadata - Video metadata
 * @returns {Array} Array of recommendations
 */
export const getCompressionRecommendations = (metadata) => {
  const recommendations = [];
  
  if (metadata.size > VIDEO_CONFIG.RECOMMENDED_VIDEO_SIZE) {
    recommendations.push({
      type: 'size',
      message: 'Consider compressing to reduce file size',
      details: `Current: ${formatFileSize(metadata.size)}, Recommended: <${formatFileSize(VIDEO_CONFIG.RECOMMENDED_VIDEO_SIZE)}`
    });
  }
  
  if (metadata.width > 1920 || metadata.height > 1080) {
    recommendations.push({
      type: 'resolution',
      message: 'Consider reducing resolution to 1080p',
      details: `Current: ${metadata.width}×${metadata.height}, Recommended: 1920×1080 or lower`
    });
  }
  
  if (metadata.duration > VIDEO_CONFIG.MAX_DURATION) {
    recommendations.push({
      type: 'duration',
      message: 'Consider splitting into shorter segments',
      details: `Current: ${formatDuration(metadata.duration)}, Recommended: <${formatDuration(VIDEO_CONFIG.MAX_DURATION)}`
    });
  }
  
  // Bitrate recommendations
  if (metadata.duration > 0) {
    const estimatedBitrate = (metadata.size * 8) / metadata.duration / (1024 * 1024);
    if (estimatedBitrate > 10) {
      recommendations.push({
        type: 'bitrate',
        message: 'Consider reducing video bitrate',
        details: `Current: ~${estimatedBitrate.toFixed(1)} Mbps, Recommended: 5-10 Mbps for 1080p`
      });
    }
  }
  
  return recommendations;
};

/**
 * Create video upload progress component data
 * @param {File} file - Video file
 * @param {number} progress - Upload progress (0-100)
 * @param {number} speed - Upload speed in bytes/second
 * @returns {Object} Progress component data
 */
export const createVideoUploadProgress = (file, progress, speed) => {
  const uploaded = (file.size * progress) / 100;
  const remaining = file.size - uploaded;
  const timeRemaining = speed > 0 ? remaining / speed : 0;
  
  return {
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    progress,
    uploaded: formatFileSize(uploaded),
    remaining: formatFileSize(remaining),
    speed: formatFileSize(speed) + '/s',
    timeRemaining: formatDuration(timeRemaining),
    type: 'video'
  };
};

export default {
  validateVideoFile,
  getVideoMetadata,
  validateVideoMetadata,
  getVideoUploadEstimate,
  getCompressionRecommendations,
  createVideoUploadProgress,
  VIDEO_CONFIG
};