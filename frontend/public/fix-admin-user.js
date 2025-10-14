// 🚀 FarmNex Admin Dashboard User Fix
// Run this script in your browser console to fix the user display issue

console.log('🌾 FarmNex Admin Dashboard User Fix');
console.log('===================================');

// Function to set current user data
function setAdminUser(userData = {}) {
    const defaultUserData = {
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
        ...userData
    };

    try {
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(defaultUserData));
        
        // Create a token for consistency  
        const token = btoa(JSON.stringify({
            ...defaultUserData,
            exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            iat: Date.now()
        }));
        
        localStorage.setItem('token', `Bearer.${token}.signature`);
        
        console.log('✅ Admin user data set successfully!');
        console.log('📊 User Data:', defaultUserData);
        console.log('🔄 Please refresh your admin dashboard page to see the changes.');
        
        return true;
    } catch (error) {
        console.error('❌ Error setting admin user data:', error);
        return false;
    }
}

// Function to check current user
function checkCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        
        console.log('📋 Current User Status:');
        console.log('User Data:', userData ? JSON.parse(userData) : 'None');
        console.log('Token:', token ? 'Present' : 'None');
        
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('❌ Error checking current user:', error);
        return null;
    }
}

// Function to clear user data
function clearUserData() {
    try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        console.log('🗑️ User data cleared successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error clearing user data:', error);
        return false;
    }
}

// Auto-fix the issue
console.log('🔧 Auto-fixing admin dashboard user display issue...');

// Check if user data exists
const currentUser = checkCurrentUser();

if (!currentUser) {
    console.log('❌ No user data found. Setting default admin user...');
    setAdminUser();
} else {
    console.log('✅ User data already exists:', currentUser.name);
    console.log('💡 If the dashboard still shows wrong info, try refreshing the page.');
}

// Make functions available globally for manual use
window.setAdminUser = setAdminUser;
window.checkCurrentUser = checkCurrentUser;
window.clearUserData = clearUserData;

console.log('');
console.log('🛠️ Available Commands:');
console.log('setAdminUser()     - Set admin user data');
console.log('checkCurrentUser() - Check current user status');  
console.log('clearUserData()    - Clear all user data');
console.log('');
console.log('🎯 To customize user data, run:');
console.log('setAdminUser({ name: "Your Name", email: "your@email.com" })');
console.log('');
console.log('🔄 After running the fix, refresh your admin dashboard page!');