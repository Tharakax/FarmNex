import crypto from 'crypto';
import User from '../models/usermodel.js';

class SessionService {
  
  /**
   * Create a new session for a user and invalidate any existing session
   * @param {string} userId - User ID
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   * @returns {Object} Session data
   */
  async createSession(userId, ipAddress, userAgent) {
    try {
      // Generate a unique session ID
      const sessionId = crypto.randomBytes(32).toString('hex');
      const loginTime = new Date();
      
      // Update user with new session, this automatically invalidates any existing session
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          currentSession: {
            sessionId,
            loginTime,
            lastActivity: loginTime,
            ipAddress,
            userAgent
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      console.log(`✅ New session created for user ${userId}: ${sessionId}`);
      
      return {
        sessionId,
        loginTime,
        userId: updatedUser._id
      };
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }

  /**
   * Validate if a session is active and valid
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID to validate
   * @returns {boolean} True if session is valid
   */
  async validateSession(userId, sessionId) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.currentSession || !user.currentSession.sessionId) {
        return false;
      }

      // Check if the session ID matches
      if (user.currentSession.sessionId !== sessionId) {
        return false;
      }

      // Check if session hasn't expired (24 hours)
      const sessionAge = Date.now() - new Date(user.currentSession.loginTime).getTime();
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxSessionAge) {
        // Session expired, clear it
        await this.clearSession(userId);
        return false;
      }

      // Update last activity
      await this.updateLastActivity(userId);
      
      return true;
    } catch (error) {
      console.error('❌ Error validating session:', error);
      return false;
    }
  }

  /**
   * Update the last activity timestamp for a session
   * @param {string} userId - User ID
   */
  async updateLastActivity(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        'currentSession.lastActivity': new Date()
      });
    } catch (error) {
      console.error('❌ Error updating last activity:', error);
    }
  }

  /**
   * Clear/invalidate a user's session
   * @param {string} userId - User ID
   */
  async clearSession(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        currentSession: {
          sessionId: null,
          loginTime: null,
          lastActivity: null,
          ipAddress: null,
          userAgent: null
        }
      });
      
      console.log(`✅ Session cleared for user ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  }

  /**
   * Get active session info for a user
   * @param {string} userId - User ID
   * @returns {Object|null} Session info or null
   */
  async getSessionInfo(userId) {
    try {
      const user = await User.findById(userId).select('currentSession');
      return user?.currentSession || null;
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return null;
    }
  }

  /**
   * Check if user has an active session (different from current one)
   * @param {string} userId - User ID  
   * @param {string} currentSessionId - Current session ID to exclude
   * @returns {boolean} True if user has another active session
   */
  async hasActiveSession(userId, currentSessionId = null) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.currentSession || !user.currentSession.sessionId) {
        return false;
      }

      // If current session ID provided, check if it's different
      if (currentSessionId && user.currentSession.sessionId === currentSessionId) {
        return false;
      }

      // Check if session hasn't expired
      const sessionAge = Date.now() - new Date(user.currentSession.loginTime).getTime();
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxSessionAge) {
        // Session expired, clear it
        await this.clearSession(userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking active session:', error);
      return false;
    }
  }

  /**
   * Clean up all expired sessions (can be run as a scheduled job)
   */
  async cleanupExpiredSessions() {
    try {
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      const cutoffTime = new Date(Date.now() - maxSessionAge);

      const result = await User.updateMany(
        {
          'currentSession.loginTime': { $lt: cutoffTime },
          'currentSession.sessionId': { $ne: null }
        },
        {
          $set: {
            'currentSession.sessionId': null,
            'currentSession.loginTime': null,
            'currentSession.lastActivity': null,
            'currentSession.ipAddress': null,
            'currentSession.userAgent': null
          }
        }
      );

      console.log(`✅ Cleaned up ${result.modifiedCount} expired sessions`);
      return result.modifiedCount;
    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
      return 0;
    }
  }
}

export default new SessionService();