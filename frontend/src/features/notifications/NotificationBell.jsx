import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationAPI from '../../services/notificationAPI';
import { getLoggedInUser } from '../../utils/userUtils';

const getMockNotifications = (role) => {
  const base = [
    {
      id: 'mock-1',
      _id: 'mock-1',
      title: 'System Maintenance',
      body: 'Scheduled system maintenance tonight from 12 AM to 2 AM.',
      type: 'UPDATE',
      priority: 'MEDIUM',
      audience: 'ALL',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
  ];

  if (role === 'farmer') {
    base.unshift({
      id: 'mock-farmer-1',
      _id: 'mock-farmer-1',
      title: 'Weather Alert',
      body: 'Heavy rain expected. Protect crops accordingly.',
      type: 'ALERT',
      priority: 'HIGH',
      audience: 'FARMER',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
    });
  } else if (role === 'user') {
    base.unshift({
      id: 'mock-user-1',
      _id: 'mock-user-1',
      title: 'New Products Available',
      body: 'Fresh vegetables are now available. Order today!',
      type: 'OFFER',
      priority: 'MEDIUM',
      audience: 'USER',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      isRead: false,
    });
  }

  return base.slice(0, 10);
};

const NotificationBell = ({ className = '' }) => {
  const navigate = useNavigate();
  const currentUser = getLoggedInUser();
  const userRole = currentUser?.role?.toLowerCase();
  const userId = currentUser?.id;

  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState(new Set());

  const STORAGE_READ = `notif:read:${userId || 'guest'}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load read notifications
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_READ) || '[]');
      setReadNotifications(new Set(stored));
    } catch {
      setReadNotifications(new Set());
    }
  }, [STORAGE_READ]);

  // Save read notifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_READ, JSON.stringify(Array.from(readNotifications)));
    } catch {}
  }, [readNotifications, STORAGE_READ]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const audience = userRole === 'farmer' ? 'FARMER' : userRole === 'user' ? 'USER' : 'ALL';
      const result = await notificationAPI.getNotificationsByAudience(audience);

      let fetched = result.success ? result.data : getMockNotifications(userRole);
      fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(fetched.slice(0, 10));

      const unread = fetched.filter(n => !readNotifications.has(n._id || n.id)).length;
      setUnreadCount(unread);
    } catch {
      const mock = getMockNotifications(userRole);
      setNotifications(mock);
      const unread = mock.filter(n => !readNotifications.has(n._id || n.id)).length;
      setUnreadCount(unread);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userRole]);

  const markAsRead = (id) => {
    setReadNotifications(prev => new Set([...prev, id]));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n._id || n.id);
    setReadNotifications(new Set(allIds));
    setUnreadCount(0);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'border-l-red-500 bg-gray-50';
      case 'MEDIUM': return 'border-l-yellow-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-gray-50';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'ALERT': return 'bg-red-100 text-red-800 border-red-200';
      case 'OFFER': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'ALERT': return '⚠️';
      case 'OFFER': return '🎉';
      default: return '📢';
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
        title={unreadCount > 0 ? `${unreadCount} new notifications` : 'Notifications'}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">No notifications</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const id = n._id || n.id;
                const isRead = readNotifications.has(id);
                return (
                  <div
                    key={id}
                    className={`p-4 cursor-pointer border-l-4 ${getPriorityColor(n.priority)} ${isRead ? 'bg-gray-100' : 'bg-yellow-50'}`}
                    onClick={() => markAsRead(id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(n.type)}`}>
                          {n.type}
                        </span>
                      </div>
                      {isRead && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                    
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-sm mt-1">{getTypeIcon(n.type)}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{n.body}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={markAllAsRead}
                className="w-full text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md py-2"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;