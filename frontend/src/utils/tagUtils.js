/**
 * Utility functions for handling and cleaning tags across the application
 */

/**
 * Parse and clean tags from various formats
 * @param {string|Array} tags - Tags in various formats (string, array, comma-separated)
 * @param {number} maxTags - Maximum number of tags to return (default: 10)
 * @returns {Array} Clean array of tag strings
 */
export const parseAndCleanTags = (tags, maxTags = 10) => {
  if (!tags) return [];
  
  let tagsArray = [];
  
  // Handle different tag formats
  if (Array.isArray(tags)) {
    tagsArray = tags;
  } else if (typeof tags === 'string') {
    // If it's a comma-separated string
    if (tags.includes(',')) {
      tagsArray = tags.split(',');
    } else {
      tagsArray = [tags];
    }
  }
  
  // Clean and filter tags
  const cleanedTags = tagsArray
    .map(tag => {
      if (typeof tag !== 'string') {
        tag = String(tag);
      }
      // Remove all brackets, quotes, backslashes, emojis and trim
      return tag.replace(/[\[\]"\\]/g, '')
                .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
                .trim();
    })
    .filter(tag => tag && tag.length > 0) // Remove empty strings
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, maxTags); // Limit to specified number of tags
  
  return cleanedTags;
};

/**
 * Format tags for display with proper capitalization
 * @param {string|Array} tags - Tags to format
 * @param {number} maxTags - Maximum number of tags to return
 * @returns {Array} Formatted tag strings
 */
export const formatTagsForDisplay = (tags, maxTags = 10) => {
  return parseAndCleanTags(tags, maxTags)
    .map(tag => tag.toLowerCase().replace(/^\w/, c => c.toUpperCase()));
};

/**
 * Convert tags array to comma-separated string for form inputs
 * @param {Array} tags - Array of tags
 * @returns {string} Comma-separated string
 */
export const tagsToString = (tags) => {
  if (!Array.isArray(tags)) return '';
  return parseAndCleanTags(tags).join(', ');
};

/**
 * Convert comma-separated string to tags array for storage
 * @param {string} tagsString - Comma-separated tags string
 * @returns {Array} Array of clean tag strings
 */
export const stringToTags = (tagsString) => {
  if (!tagsString || typeof tagsString !== 'string') return [];
  return parseAndCleanTags(tagsString.split(','));
};

/**
 * Validate tags array
 * @param {string|Array} tags - Tags to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid and errors
 */
export const validateTags = (tags, options = {}) => {
  const {
    maxTags = 10,
    maxTagLength = 50,
    minTagLength = 1
  } = options;
  
  const cleanTags = parseAndCleanTags(tags);
  const errors = [];
  
  // Check maximum number of tags
  if (cleanTags.length > maxTags) {
    errors.push(`Maximum of ${maxTags} tags allowed`);
  }
  
  // Check individual tag lengths
  const invalidLengthTags = cleanTags.filter(
    tag => tag.length < minTagLength || tag.length > maxTagLength
  );
  
  if (invalidLengthTags.length > 0) {
    errors.push(`Each tag must be ${minTagLength}-${maxTagLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanTags
  };
};

export default {
  parseAndCleanTags,
  formatTagsForDisplay,
  tagsToString,
  stringToTags,
  validateTags
};