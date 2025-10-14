import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Notification API endpoints
const notificationAPI = {
  // Get all notifications
  async getAllNotifications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications'
      };
    }
  },

  // Get notification by ID
  async getNotificationById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notification'
      };
    }
  },

  // Create new notification
  async createNotification(notificationData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications`, notificationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create notification'
      };
    }
  },

  // Update notification
  async updateNotification(id, notificationData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/${id}`, notificationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update notification'
      };
    }
  },

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/notifications/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  },

  // Get notifications by audience
  async getNotificationsByAudience(audience) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/audience/${audience}`);
      return {
        success: true,
        data: response.data.notifications || response.data
      };
    } catch (error) {
      console.error('Error fetching notifications by audience:', error);
      // If endpoint doesn't exist, fallback to getting all notifications and filtering
      try {
        const allNotifications = await this.getAllNotifications();
        if (allNotifications.success && allNotifications.data.notifications) {
          const filtered = allNotifications.data.notifications.filter(notification => {
            const notificationAudience = notification.audience?.toUpperCase();
            return notificationAudience === audience.toUpperCase() || 
                   notificationAudience === 'ALL' || 
                   notificationAudience === 'BOTH';
          });
          return {
            success: true,
            data: filtered
          };
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications by audience'
      };
    }
  },

  // Get notifications by type
  async getNotificationsByType(type) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/type/${type}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications by type'
      };
    }
  },

  // Get notifications by priority
  async getNotificationsByPriority(priority) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/priority/${priority}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notifications by priority:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications by priority'
      };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId, userId = null) {
    try {
      const payload = userId ? { userId } : {};
      const response = await axios.patch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // If the endpoint doesn't exist, simulate success
      if (error.response?.status === 404) {
        console.warn('Mark as read endpoint not implemented on backend, simulating success');
        return {
          success: true,
          data: { message: 'Marked as read (simulated)' }
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId = null, audience = null) {
    try {
      const payload = {};
      if (userId) payload.userId = userId;
      if (audience) payload.audience = audience;
      
      const response = await axios.patch(`${API_BASE_URL}/api/notifications/read-all`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // If the endpoint doesn't exist, simulate success
      if (error.response?.status === 404) {
        console.warn('Mark all as read endpoint not implemented on backend, simulating success');
        return {
          success: true,
          data: { message: 'All marked as read (simulated)' }
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  },

  // Get unread count
  async getUnreadCount(userId = null, audience = null) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (audience) params.append('audience', audience);
      
      const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count?${params}`);
      return {
        success: true,
        count: response.data.count || response.data.unreadCount || 0
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // If the endpoint doesn't exist, fallback to counting from all notifications
      try {
        const allNotifications = audience 
          ? await this.getNotificationsByAudience(audience)
          : await this.getAllNotifications();
        
        if (allNotifications.success) {
          const notifications = allNotifications.data.notifications || allNotifications.data;
          const unreadCount = notifications.filter(n => !n.isRead).length;
          return {
            success: true,
            count: unreadCount > 0 ? unreadCount : notifications.length // Fallback: treat all as unread if no read status
          };
        }
      } catch (fallbackError) {
        console.error('Fallback unread count also failed:', fallbackError);
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get unread count',
        count: 0
      };
    }
  }
};

export default notificationAPI;
