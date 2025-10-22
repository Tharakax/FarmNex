import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserNotifications();
    fetchUserStats();
  }, []);

  const fetchUserNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications/role/user');
      setNotifications(response.data.notifications);
    } catch (error) {
      if (error.response?.status === 404) {
        setNotifications([]);
      } else {
        setError('Failed to fetch marketplace notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications/stats/user');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch user notification stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ALERT': return '⚠️';
      case 'OFFER': return '🎉';
      case 'UPDATE': return '📢';
      default: return '💬';
    }
  };

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-600">Loading marketplace notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User-header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🏪 Marketplace Notifications
            </h2>
            <p className="text-blue-100 mt-1">Stay updated with fresh deals and platform updates</p>
          </div>
          {stats && (
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-blue-100">Total Messages</div>
            </div>
          )}
        </div>
      </div>

      {/* User-stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-orange-600">{stats.offers}</p>
              </div>
              <div className="text-2xl">🎉</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Updates</p>
                <p className="text-2xl font-bold text-blue-600">{stats.updates}</p>
              </div>
              <div className="text-2xl">📢</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.recent}</p>
              </div>
              <div className="text-2xl">📅</div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-600">
              <span className="text-lg mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {notifications.length === 0 && !error ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">No Marketplace Notifications</h3>
            <p className="text-blue-600">You're all caught up! No new marketplace updates at this time.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow p-6 ${
                notification.roleSpecific?.urgencyLevel === 'critical' ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    {notification.type === 'OFFER' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-pink-400 text-white">
                        LIMITED TIME
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-3">{notification.body}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        {formatDate(notification.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        {notification.audience === 'USER' ? 'Users Only' : 'All Users'}
                      </span>
                      {notification.emailSent && (
                        <span className="flex items-center gap-1 text-blue-600">
                          Email Sent
                        </span>
                      )}
                    </div>
                    {notification.type === 'OFFER' && (
                      <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors">
                        View Offer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserNotifications;