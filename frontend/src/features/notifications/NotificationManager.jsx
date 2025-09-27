import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ farmer: null, user: null });
  const [activeTab, setActiveTab] = useState('create');
  const [selectedRole, setSelectedRole] = useState('both');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'USER',
    type: 'UPDATE',
    priority: 'MEDIUM',
    sendEmail: false
  });

  useEffect(() => {
    fetchAllNotifications();
    fetchStats();
  }, []);

  const fetchAllNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [farmerStats, userStats] = await Promise.all([
        axios.get('http://localhost:3000/api/notifications/stats/farmer'),
        axios.get('http://localhost:3000/api/notifications/stats/user')
      ]);
      
      setStats({
        farmer: farmerStats.data.stats,
        user: userStats.data.stats
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3000/api/notifications', formData);
      
      // Show success message with details
      const notification = response.data.notification;
      const emailStatus = response.data.emailStatus;
      
      let successMessage = `✅ Notification "${notification.title}" created successfully!\n`;
      successMessage += `🆔 ID: ${notification.notificationId}\n`;
      
      if (formData.sendEmail) {
        if (emailStatus?.success) {
          successMessage += `📧 Email sent to ${emailStatus.successCount} recipients`;
        } else {
          successMessage += `⚠️ Email sending failed: ${emailStatus?.message}`;
        }
      }
      
      alert(successMessage);
      
      // Reset form
      setFormData({
        title: '',
        body: '',
        audience: 'USER',
        type: 'UPDATE',
        priority: 'MEDIUM',
        sendEmail: false
      });
      
      // Refresh data
      fetchAllNotifications();
      fetchStats();
    } catch (error) {
      alert('❌ Failed to create notification: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getRoleFilteredNotifications = () => {
    if (selectedRole === 'both') return notifications;
    
    return notifications.filter(notification => {
      if (selectedRole === 'farmer') {
        return ['FARMER', 'BOTH'].includes(notification.audience);
      } else {
        return ['USER', 'BOTH'].includes(notification.audience);
      }
    });
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
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Notification Management</h1>
        <p className="text-gray-600">Create and manage notifications for farmers and marketplace users</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Farmer Stats */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            🌾 Farmer Notifications
          </h3>
          {stats.farmer && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.farmer.total}</div>
                <div className="text-sm text-green-700">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.farmer.alerts}</div>
                <div className="text-sm text-green-700">Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.farmer.offers}</div>
                <div className="text-sm text-green-700">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.farmer.recent}</div>
                <div className="text-sm text-green-700">This Week</div>
              </div>
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            🏪 User Notifications
          </h3>
          {stats.user && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.user.total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.user.alerts}</div>
                <div className="text-sm text-blue-700">Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.user.offers}</div>
                <div className="text-sm text-blue-700">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.user.recent}</div>
                <div className="text-sm text-blue-700">This Week</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ➕ Create Notification
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Manage Notifications
          </button>
        </nav>
      </div>

      {/* Create Notification Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Notification</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">🏪 Marketplace Users</option>
                  <option value="FARMER">🌾 Farmers</option>
                  <option value="BOTH">👥 Both Groups</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Body *
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UPDATE">📢 Update</option>
                  <option value="ALERT">🚨 Alert</option>
                  <option value="OFFER">🎉 Offer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="sendEmail"
                checked={formData.sendEmail}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                📧 Send email notifications to target audience
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '⏳ Creating...' : '✅ Create Notification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Notifications Tab */}
      {activeTab === 'manage' && (
        <div>
          {/* Role Filter */}
          <div className="mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedRole('both')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedRole === 'both'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 All Notifications
              </button>
              <button
                onClick={() => setSelectedRole('farmer')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedRole === 'farmer'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                🌾 Farmer Notifications
              </button>
              <button
                onClick={() => setSelectedRole('user')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedRole === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                🏪 User Notifications
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {getRoleFilteredNotifications().length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications Found</h3>
                <p className="text-gray-500">No notifications available for the selected filter.</p>
              </div>
            ) : (
              getRoleFilteredNotifications().map((notification) => (
                <div key={notification._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {notification.type}
                        </span>
                        {notification.emailSent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Email Sent
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{notification.body}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>🆔 {notification.notificationId}</span>
                        <span>🎯 {notification.audience}</span>
                        <span>📅 {formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;