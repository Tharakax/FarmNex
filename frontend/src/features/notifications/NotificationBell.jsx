import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, Megaphone, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationAPI from '../../services/notificationAPI';
import { getLoggedInUser } from '../../utils/userUtils';

// Mock notifications for when API is unavailable
const getMockNotifications = (userRole) => {
  const baseNotifications = [
    {
      id: 'mock-1',
      _id: 'mock-1',
      title: 'System Maintenance',
      body: 'Scheduled system maintenance will occur tonight from 12 AM to 2 AM. Some features may be temporarily unavailable.',
      type: 'UPDATE',
      priority: 'MEDIUM',
      audience: 'ALL',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false
    },
    {
      id: 'mock-2',
      _id: 'mock-2',
      title: 'Welcome to FarmNex!',
      body: 'Thank you for joining FarmNex. Explore our features and start managing your farm operations efficiently.',
      type: 'OFFER',
      priority: 'LOW',
      audience: 'ALL',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isRead: false
    }
  ];

  // Add role-specific notifications
  if (userRole === 'farmer') {
    baseNotifications.unshift({
      id: 'mock-farmer-1',
      _id: 'mock-farmer-1',
      title: 'Weather Alert',
      body: 'Heavy rain expected in your area. Consider protecting sensitive crops and adjusting irrigation schedules.',
      type: 'ALERT',
      priority: 'HIGH',
      audience: 'FARMER',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      isRead: false
    });
  } else if (userRole === 'customer' || userRole === 'user') {
    baseNotifications.unshift({
      id: 'mock-customer-1',
      _id: 'mock-customer-1',
      title: 'New Products Available',
      body: 'Fresh organic vegetables from local farms are now available in your area. Order now for same-day delivery!',
      type: 'OFFER',
      priority: 'MEDIUM',
      audience: 'USER',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      isRead: false
    });
  } else if (userRole === 'admin') {
    baseNotifications.unshift({
      id: 'mock-admin-1',
      _id: 'mock-admin-1',
      title: 'Daily Report Available',
      body: 'Your daily system report is ready. 25 new user registrations, 150 orders processed, 12 support tickets resolved.',
      type: 'UPDATE',
      priority: 'LOW',
      audience: 'ADMIN',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      isRead: false
    });
  }

  return baseNotifications.slice(0, 10); // Return max 10 notifications
};

const NotificationBell = ({ className = "" }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const dropdownRef = useRef(null);

  const currentUser = getLoggedInUser();
  const userRole = currentUser?.role?.toLowerCase();
  const userId = currentUser?.id;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications based on user role
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine which notifications to fetch based on user role
      let audience = 'ALL'; // Default to all notifications
      if (userRole === 'farmer') {
        audience = 'FARMER';
      } else if (userRole === 'customer' || userRole === 'user') {
        audience = 'USER';
      }

      const result = await notificationAPI.getNotificationsByAudience(audience);
      
      if (result.success) {
        // Sort notifications by date (newest first)
        const sortedNotifications = result.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Take only the most recent 10 notifications
        const recentNotifications = sortedNotifications.slice(0, 10);
        
        setNotifications(recentNotifications);
        setUsingMockData(false);
        
        // Count actual unread notifications
        const actualUnread = recentNotifications.filter(n => 
          !n.isRead && !readNotifications.has(n._id || n.id)
        ).length;
        
        // If no backend read status, treat non-locally-read as unread
        const unread = actualUnread > 0 ? actualUnread : 
          recentNotifications.filter(n => !readNotifications.has(n._id || n.id)).length;
        
        setUnreadCount(unread);
      } else {
        // If audience-specific fetch fails, try getting all notifications
        const allResult = await notificationAPI.getAllNotifications();
        if (allResult.success) {
          const sortedNotifications = allResult.data.notifications?.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          ) || [];
          const recentNotifications = sortedNotifications.slice(0, 10);
          setNotifications(recentNotifications);
          
          // Count unread notifications
          const unread = recentNotifications.filter(n => 
            !n.isRead && !readNotifications.has(n._id || n.id)
          ).length;
          setUnreadCount(unread > 0 ? unread : 
            recentNotifications.filter(n => !readNotifications.has(n._id || n.id)).length
          );
        } else {
          // If both API calls fail, use mock data
          console.warn('API unavailable, using mock notifications');
          const mockNotifications = getMockNotifications(userRole);
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.length);
          setUsingMockData(true);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // If it's a network error, use mock data instead of showing error
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error') || !navigator.onLine) {
        console.warn('Network unavailable, using mock notifications');
        const mockNotifications = getMockNotifications(userRole);
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.length);
        setUsingMockData(true);
        setError(null);
      } else {
        // For other errors, try mock data as fallback
        console.warn('API error, falling back to mock notifications');
        const mockNotifications = getMockNotifications(userRole);
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.length);
        setUsingMockData(true);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userRole]);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'OFFER':
        return <Megaphone className="w-4 h-4 text-green-500" />;
      case 'UPDATE':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50';
      case 'MEDIUM':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'LOW':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const result = await notificationAPI.markAsRead(notificationId, userId);
      if (result.success) {
        setReadNotifications(prev => new Set([...prev, notificationId]));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (markingAllAsRead) return;
    
    try {
      setMarkingAllAsRead(true);
      
      // Determine audience for the API call
      let audience = 'ALL';
      if (userRole === 'farmer') {
        audience = 'FARMER';
      } else if (userRole === 'customer' || userRole === 'user') {
        audience = 'USER';
      }
      
      const result = await notificationAPI.markAllAsRead(userId, audience);
      if (result.success) {
        // Mark all current notifications as read locally
        const allIds = notifications.map(n => n._id || n.id);
        setReadNotifications(prev => new Set([...prev, ...allIds]));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    const notificationId = notification._id || notification.id;
    
    // Mark as read when clicked
    if (!notification.isRead && !readNotifications.has(notificationId)) {
      await markNotificationAsRead(notificationId);
    }
    
    setIsOpen(false);
    // Navigate to notifications page with specific notification highlighted
    navigate(`/notifications?highlight=${notificationId}`);
  };

  // Handle view all notifications
  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  // Handle bell click
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(); // Refresh when opening
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {usingMockData && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full" title="Using demo data - backend not available">
                  Demo
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">New notifications will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const notificationId = notification._id || notification.id;
                  const isRead = notification.isRead || readNotifications.has(notificationId);
                  
                  return (
                    <div
                      key={notificationId}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                        isRead ? 'bg-gray-50/50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          {!isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Unread"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            isRead ? 'font-normal text-gray-700' : 'font-medium text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 line-clamp-2 ${
                            isRead ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.body}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.priority?.toUpperCase() === 'HIGH' 
                                  ? 'bg-red-100 text-red-700' 
                                  : notification.priority?.toUpperCase() === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {notification.priority || 'Low'}
                              </span>
                              {isRead && (
                                <Check className="w-3 h-3 text-green-500" title="Read" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3 space-y-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAllAsRead}
                  className="w-full flex items-center justify-center space-x-2 text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingAllAsRead ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Marking as read...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark all as read</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleViewAll}
                className="w-full text-center text-green-600 hover:text-green-800 text-sm font-medium py-2 hover:bg-green-50 rounded-md transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;