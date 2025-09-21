// Training utilities for state management and helper functions

/**
 * Format file size to human readable format
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
 * Format date to human readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'Unknown';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get status color classes for UI
 * @param {string} status - Material status
 * @returns {string} - CSS classes for status styling
 */
export const getStatusColor = (status) => {
  const colors = {
    published: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    archived: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return colors[status?.toLowerCase()] || colors.draft;
};

/**
 * Get difficulty color classes for UI
 * @param {string} difficulty - Material difficulty
 * @returns {string} - CSS classes for difficulty styling
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };
  
  return colors[difficulty?.toLowerCase()] || colors.beginner;
};

/**
 * Get file type icon based on file extension or MIME type
 * @param {string} fileName - File name or MIME type
 * @returns {string} - Icon name
 */
export const getFileTypeIcon = (fileName) => {
  if (!fileName) return 'file';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap = {
    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    
    // Videos
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    webm: 'video',
    
    // Documents
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    txt: 'file-text',
    
    // Audio
    mp3: 'music',
    wav: 'music',
    m4a: 'music',
    ogg: 'music',
    
    // Archives
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive'
  };
  
  return iconMap[extension] || 'file';
};

/**
 * Validate training material form data
 * @param {Object} data - Form data
 * @param {File} file - Uploaded file
 * @returns {Object} - Validation result
 */
export const validateTrainingMaterial = (data, file = null, isEditing = false) => {
  const errors = [];
  const warnings = [];
  
  // Title validation
  if (!data.title?.trim()) {
    errors.push('Title is required');
  } else if (data.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  } else if (data.title.length > 100) {
    errors.push('Title must not exceed 100 characters');
  }
  
  // Description validation
  if (!data.description?.trim()) {
    errors.push('Description is required');
  } else if (data.description.length < 20) {
    errors.push('Description must be at least 20 characters long');
  } else if (data.description.length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }
  
  // Category validation
  if (!data.category) {
    errors.push('Category is required');
  }
  
  // Content validation for articles
  if (data.type === 'Article') {
    if (!data.content?.trim()) {
      errors.push('Content is required for articles');
    } else if (data.content.length < 50) {
      errors.push('Article content must be at least 50 characters long');
    } else if (data.content.length > 50000) {
      errors.push('Article content must not exceed 50,000 characters');
    }
  }
  
  // File validation
  if (!file && !isEditing) {
    errors.push('File upload is required');
  }
  
  if (file) {
    // File size validation (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size must be less than 50MB');
    }
    
    // File type validation
    const allowedTypes = {
      'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'],
      'PDF': ['application/pdf'],
      'Guide': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
      'Article': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
      'FAQ': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    };
    
    const typeAllowed = allowedTypes[data.type] || [];
    if (typeAllowed.length > 0 && !typeAllowed.includes(file.type)) {
      errors.push(`Invalid file type for ${data.type}. Please upload a supported format.`);
    }
  }
  
  // Tags validation
  if (!data.tags?.trim()) {
    errors.push('At least one tag is required');
  } else {
    const tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tags.length === 0) {
      errors.push('At least one tag is required');
    } else {
      if (tags.length > 10) {
        errors.push('Maximum of 10 tags allowed');
      }
      const invalidTags = tags.filter(tag => tag.length > 50);
      if (invalidTags.length > 0) {
        errors.push('Each tag must be less than 50 characters');
      }
    }
  }
  
  // Type validation
  if (!data.type) {
    errors.push('Content type is required');
  }
  
  // Difficulty validation
  if (!data.difficulty) {
    errors.push('Difficulty level is required');
  }
  
  // Status validation
  if (!data.status) {
    errors.push('Status is required');
  }
  
  // Warnings for best practices
  if (data.status === 'draft') {
    warnings.push('Remember to publish your material when ready');
  }
  
  if (data.type === 'Article' && data.content && data.content.length < 200) {
    warnings.push('Consider adding more detailed content for better engagement');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Generate form data for API submission
 * @param {Object} data - Form data
 * @returns {Object} - Processed form data
 */
export const processFormData = (data) => {
  return {
    ...data,
    title: data.title?.trim(),
    description: data.description?.trim(),
    content: data.content?.trim(),
    tags: Array.isArray(data.tags) 
      ? data.tags 
      : data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || []
  };
};

/**
 * Search and filter materials
 * @param {Array} materials - Array of materials
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered materials
 */
export const filterMaterials = (materials, filters = {}) => {
  if (!Array.isArray(materials)) return [];
  
  const { search, category, status, difficulty, type } = filters;
  
  return materials.filter(material => {
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      const matchesSearch = 
        material.title?.toLowerCase().includes(searchTerm) ||
        material.description?.toLowerCase().includes(searchTerm) ||
        material.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (category && material.category !== category) return false;
    
    // Status filter
    if (status && material.status !== status) return false;
    
    // Difficulty filter
    if (difficulty && material.difficulty !== difficulty) return false;
    
    // Type filter
    if (type && material.type !== type) return false;
    
    return true;
  });
};

/**
 * Sort materials by different criteria
 * @param {Array} materials - Array of materials
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Array} - Sorted materials
 */
export const sortMaterials = (materials, sortBy = 'createdAt', sortOrder = 'desc') => {
  if (!Array.isArray(materials)) return [];
  
  return materials.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'category':
        aValue = a.category?.toLowerCase() || '';
        bValue = b.category?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      case 'views':
        aValue = a.views || 0;
        bValue = b.views || 0;
        break;
      case 'createdAt':
      case 'updatedAt':
        aValue = new Date(a[sortBy] || 0);
        bValue = new Date(b[sortBy] || 0);
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Calculate training statistics
 * @param {Array} materials - Array of materials
 * @returns {Object} - Calculated statistics
 */
export const calculateStatistics = (materials) => {
  if (!Array.isArray(materials)) {
    return {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0,
      categories: 0,
      averageViews: 0
    };
  }
  
  const stats = {
    total: materials.length,
    published: materials.filter(m => m.status === 'published').length,
    draft: materials.filter(m => m.status === 'draft').length,
    archived: materials.filter(m => m.status === 'archived').length,
    totalViews: materials.reduce((sum, m) => sum + (m.views || 0), 0),
    categories: new Set(materials.map(m => m.category).filter(Boolean)).size,
    averageViews: 0
  };
  
  stats.averageViews = stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0;
  
  return stats;
};

// Export default object with all utilities
export default {
  formatFileSize,
  formatDate,
  getStatusColor,
  getDifficultyColor,
  getFileTypeIcon,
  validateTrainingMaterial,
  processFormData,
  filterMaterials,
  sortMaterials,
  calculateStatistics
};