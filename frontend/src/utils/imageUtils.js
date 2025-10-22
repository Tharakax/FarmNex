// Utility functions for handling images and placeholders

/**
 * Generates a data URL for a placeholder image
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder  
 * @param {string} text - Text to display (default: "No Image")
 * @param {string} bgColor - Background color (default: "#f3f4f6")
 * @param {string} textColor - Text color (default: "#6b7280")
 * @returns {string} Data URL for the placeholder image
 */
export const generatePlaceholder = (
  width = 200, 
  height = 200, 
  text = "No Image", 
  bgColor = "#f3f4f6", 
  textColor = "#6b7280"
) => {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Set background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Set text style
  const fontSize = Math.min(width, height) / 8;
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw text
  ctx.fillText(text, width / 2, height / 2);
  
  // Return data URL
  return canvas.toDataURL('image/png');
};

/**
 * Gets a placeholder image URL - local fallback instead of external service
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} text - Text to display
 * @returns {string} Local placeholder image URL
 */
export const getPlaceholderUrl = (width = 200, height = 200, text = "No Image") => {
  return generatePlaceholder(width, height, text);
};

/**
 * Handles image load errors by setting a placeholder
 * @param {Event} event - The error event
 * @param {number} width - Width for placeholder
 * @param {number} height - Height for placeholder
 * @param {string} text - Text for placeholder
 */
export const handleImageError = (event, width = 200, height = 200, text = "No Image") => {
  event.target.src = getPlaceholderUrl(width, height, text);
  event.target.onerror = null; // Prevent infinite loop
};

/**
 * Creates a default product placeholder
 * @param {string} productName - Name of the product
 * @returns {string} Placeholder image URL
 */
export const getProductPlaceholder = (productName = "Product") => {
  return generatePlaceholder(300, 300, productName, "#f9fafb", "#374151");
};

/**
 * Creates a user avatar placeholder
 * @param {string} userName - Name of the user
 * @returns {string} Placeholder avatar URL
 */
export const getUserAvatarPlaceholder = (userName = "User") => {
  const initials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return generatePlaceholder(150, 150, initials, "#e5e7eb", "#1f2937");
};

/**
 * Resolve a product image source into a usable URL with graceful fallbacks.
 * Handles:
 * - null/empty src -> placeholder with product name
 * - malformed data URLs (prefixed paths or too short) -> placeholder
 * - proper data URLs -> returned as-is
 * - external via.placeholder.com -> replaced with local placeholder
 * - absolute http(s) URLs -> returned as-is
 * - relative paths -> resolved against VITE_BACKEND_URL (uploads/ fallback)
 */
export const resolveProductImage = (src, productName = 'Product') => {
  if (!src) return getProductPlaceholder(productName);

  try {
    // Malformed data URL that includes a path before data:image
    if (typeof src === 'string' && src.includes('data:image')) {
      const idx = src.indexOf('data:image');
      const dataUrl = idx >= 0 ? src.substring(idx) : src;
      // Too short -> corrupted
      if (!dataUrl || dataUrl.length < 500) return getProductPlaceholder(productName);
      return dataUrl;
    }

    // Replace external placeholder
    if (src.includes && src.includes('via.placeholder.com')) {
      return getProductPlaceholder(productName);
    }

    // Absolute URL
    if (src.startsWith && (src.startsWith('http://') || src.startsWith('https://'))) {
      return src;
    }

    const base = (typeof window !== 'undefined' && import.meta?.env?.VITE_BACKEND_URL) || 'http://localhost:3000';
    if (src.startsWith && src.startsWith('/')) {
      return `${base}${src}`;
    }

    // Assume uploads-relative
    return `${base}/uploads/${src}`;
  } catch (e) {
    return getProductPlaceholder(productName);
  }
};
