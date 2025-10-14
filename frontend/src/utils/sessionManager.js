import axios from 'axios';
import { clearCurrentUser } from './authUtils.js';

class SessionManager {
  constructor() {
    this.sessionCheckInterval = null;
    this.isCheckingSession = false;
    this.SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
    this.ACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes of inactivity
    this.lastActivityTime = Date.now();
    this.sessionCheckUrl = '/users/session/status';
    
    // Bind methods to preserve 'this' context
    this.handleUserActivity = this.handleUserActivity.bind(this);
    this.checkSessionStatus = this.checkSessionStatus.bind(this);
    this.forceLogout = this.forceLogout.bind(this);
    
    this.setupActivityListeners();
    console.log('🔒 SessionManager initialized');
  }

  /**
   * Start monitoring user session (TEMPORARILY DISABLED)
   */
  startSessionMonitoring() {
    console.log('⚠️ Session monitoring temporarily disabled to fix login issues');
    return; // Temporarily disabled
    
    if (this.sessionCheckInterval) {
      console.log('⚠️ Session monitoring already active');
      return;
    }

    console.log('🔄 Starting session monitoring...');
    
    // Initial session check
    this.checkSessionStatus();
    
    // Set up periodic session checks
    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionStatus();
    }, this.SESSION_CHECK_INTERVAL);
  }

  /**
   * Stop monitoring user session
   */
  stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('🛑 Session monitoring stopped');
    }
  }

  /**
   * Check current session status with server
   */
  async checkSessionStatus() {
    // Avoid multiple simultaneous checks
    if (this.isCheckingSession) {
      return;
    }

    // Check if user should be logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (!token) {
      console.log('📝 No token found, skipping session check');
      return;
    }

    this.isCheckingSession = true;

    try {
      console.log('🔍 Checking session status...');
      
      const response = await axios.get(this.sessionCheckUrl, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('✅ Session is valid');
        this.lastActivityTime = Date.now();
      } else {
        console.log('❌ Session invalid:', response.data.message);
        this.forceLogout('Session expired or invalid');
      }

    } catch (error) {
      console.error('❌ Session check failed:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Session validation failed';
        
        if (status === 401) {
          console.log('🚫 Session expired or unauthorized');
          this.forceLogout(message);
        } else if (status === 403) {
          console.log('🚫 Access forbidden');
          this.forceLogout('Access denied');
        } else {
          console.log(`⚠️ Session check error (${status}):`, message);
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
        console.log('🌐 Network error during session check, will retry later');
      } else {
        console.log('⚠️ Unexpected session check error:', error.message);
      }
    } finally {
      this.isCheckingSession = false;
    }
  }

  /**
   * Force logout user and redirect to login
   */
  forceLogout(reason = 'Session expired') {
    console.log(`🚪 Force logout: ${reason}`);
    
    // Stop session monitoring
    this.stopSessionMonitoring();
    
    // Clear user data
    clearCurrentUser();
    
    // Show notification to user
    this.showSessionExpiredNotification(reason);
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 2000);
  }

  /**
   * Handle user logout (called from logout button)
   */
  async logout() {
    try {
      console.log('🚪 User logout initiated...');
      
      // Stop session monitoring
      this.stopSessionMonitoring();
      
      // Call backend logout endpoint
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      if (token) {
        try {
          await axios.post('/users/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          });
          console.log('✅ Server logout successful');
        } catch (error) {
          console.error('⚠️ Server logout failed:', error.message);
          // Continue with local logout even if server logout fails
        }
      }
      
      // Clear user data
      clearCurrentUser();
      
      // Redirect to home/login page
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force local logout even if server communication fails
      clearCurrentUser();
      window.location.href = '/';
    }
  }

  /**
   * Setup activity listeners to track user activity
   */
  setupActivityListeners() {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, this.handleUserActivity, { passive: true });
    });
  }

  /**
   * Handle user activity to update last activity time
   */
  handleUserActivity() {
    this.lastActivityTime = Date.now();
  }

  /**
   * Check if user has been inactive for too long
   */
  isUserInactive() {
    const inactiveTime = Date.now() - this.lastActivityTime;
    return inactiveTime > this.ACTIVITY_THRESHOLD;
  }

  /**
   * Show session expired notification to user
   */
  showSessionExpiredNotification(reason) {
    // Try to use react-hot-toast if available
    if (window.toast) {
      window.toast.error(`${reason}. Please login again.`);
    } 
    // Fallback to browser alert
    else {
      alert(`${reason}. Please login again.`);
    }
  }

  /**
   * Update session check URL (useful for different environments)
   */
  setSessionCheckUrl(url) {
    this.sessionCheckUrl = url;
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return {
      isMonitoring: !!this.sessionCheckInterval,
      lastActivityTime: this.lastActivityTime,
      isInactive: this.isUserInactive()
    };
  }

  /**
   * Cleanup when component unmounts or app closes
   */
  cleanup() {
    this.stopSessionMonitoring();
    
    // Remove activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleUserActivity);
    });
    
    console.log('🧹 SessionManager cleaned up');
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;

// Export individual methods for convenience
export const {
  startSessionMonitoring,
  stopSessionMonitoring,
  checkSessionStatus,
  forceLogout,
  logout,
  getSessionInfo
} = sessionManager;