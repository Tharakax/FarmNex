// Authentication utilities for FarmNex
export const setCurrentUser = (userData) => {
  try {
    // Store user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Also create a simple token for consistency
    const token = btoa(JSON.stringify({
      ...userData,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      iat: Date.now()
    }));
    
    localStorage.setItem('token', `Bearer.${token}.signature`);
    
    console.log('✅ User data stored successfully:', userData);
    return true;
  } catch (error) {
    console.error('❌ Error storing user data:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

export const clearCurrentUser = () => {
  try {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    console.log('✅ User data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    return false;
  }
};

// Test function to set admin user data
export const setTestAdminUser = (customData = {}) => {
  const defaultAdminData = {
    id: 'admin-001',
    name: 'Umar Ahamed',
    fullName: 'Umar Ahamed',
    firstName: 'Umar',
    lastName: 'Ahamed', 
    email: 'umarahamed852@gmail.com',
    role: 'admin',
    isAdmin: true,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    loginTime: new Date().toISOString(),
    ...customData
  };
  
  return setCurrentUser(defaultAdminData);
};

// Test function to check if user is logged in
export const isLoggedIn = () => {
  const userData = getCurrentUser();
  const token = localStorage.getItem('token');
  return !!(userData || token);
};

// Function to update user profile
export const updateUserProfile = (updates) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    return setCurrentUser(updatedUser);
  }
  return false;
};