// Utility functions for user management

/**
 * Get logged-in user information from JWT token
 * @returns {Object} User information object
 */
export const getLoggedInUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT Payload:', payload); // Debug logging
      
      const userInfo = {
        name: payload.name || payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'User',
        email: payload.email || '',
        role: payload.role || 'user',
        id: payload.id || payload._id || '',
        firstName: payload.firstName || '',
        lastName: payload.lastName || ''
      };
      
      console.log('👤 User Info:', userInfo); // Debug logging
      return userInfo;
    }
  } catch (error) {
    console.error('Error parsing user token:', error);
  }
  
  // Fallback user info
  return {
    name: 'Anonymous User',
    email: '',
    role: 'user',
    id: '',
    firstName: '',
    lastName: ''
  };
};

/**
 * Check if the current user is an admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  const user = getLoggedInUser();
  return user.role === 'admin';
};

/**
 * Check if the current user is a farmer
 * @returns {boolean} True if user is farmer
 */
export const isFarmer = () => {
  const user = getLoggedInUser();
  return user.role === 'farmer';
};

/**
 * Get display name for user role
 * @param {string} role - User role
 * @returns {string} Display name for role
 */
export const getRoleDisplayName = (role) => {
  switch (role) {
    case 'Admin':
      return 'Administrator';
    case 'FarmStaff':
      return 'Farm Staff';
    case 'Manager':
      return 'Manager';
    case 'DeliveryStaff':
      return 'Delivery Staff';
    case 'Customer':
      return 'Customer';
    case 'admin':
      return 'Administrator';
    case 'farmer':
      return 'Farm Owner';
    case 'user':
      return 'User';
    default:
      return 'User';
  }
};

/**
 * Get proper author name for material creation
 * @returns {string} Author name to use for materials
 */
export const getAuthorName = () => {
  const user = getLoggedInUser();
  
  if (user.role === 'admin') {
    return user.name || 'Admin';
  } else if (user.role === 'farmer') {
    return user.name || 'Farmer';
  } else {
    return user.name || 'User';
  }
};

/**
 * Format author name for display purposes
 * @param {string} createdBy - The original createdBy field from database
 * @returns {string} Formatted author name for display
 */
export const formatAuthorName = (createdBy) => {
  if (!createdBy) return 'nam';
  
  // Replace 'Admin' with more user-friendly 'Administrator'
  if (createdBy === 'Admin') {
    return 'Administrator';
  }
  
  // Return the original name for all other cases
  return createdBy;
};
