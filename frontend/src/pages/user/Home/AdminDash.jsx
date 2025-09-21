import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import {
  User,
  Users,
  Plus,
  LogOut,
  Settings,
  Home,
  Sprout,
  BarChart3,
  BarChart,
  Bell,
  Search,
  Edit3,
  Trash2,
  Eye,
  UserPlus,
  Activity,
  MessageSquare 
} from 'lucide-react';
 import axios from 'axios';


function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin Data (could also be fetched from API)
  const adminData = {
    name: "Umar Ahamed",
    role: "System Administrator",
    email: "ahamedumar@gamil.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };

  // Real users data state
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeFarms: 0,
    totalCrops: 0,
    monthlyRevenue: "$0"
  });

  // Fetch users data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users
        const usersResponse = await axios.get('http://localhost:3000/users');
        setUsers(usersResponse.data.users || []);
        
        // Fetch dashboard stats (you'll need to create this endpoint)
        const statsResponse = await axios.get('http://localhost:3000/users');
        setDashboardStats(statsResponse.data);
        
        setError(null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:3000/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        // Update stats after deletion
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1
        }));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/');
    }
  };

  const filteredUsers = users.filter(user =>
  (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
);

  // Dashboard Tab
  const renderDashboard = () => (
   <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-green-600" />
          <div className="h-8 w-px bg-gray-300"></div>
          <span className="text-sm text-gray-600">Welcome back, {adminData.name}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: dashboardStats.totalUsers, icon: <Users className="h-12 w-12 text-blue-500" />, trend: '↑ 12%' },
          { label: 'Active Farms', value: dashboardStats.activeFarms, icon: <Sprout className="h-12 w-12 text-green-500" />, trend: '↑ 8%' },
          { label: 'Crop Types', value: dashboardStats.totalCrops, icon: <BarChart3 className="h-12 w-12 text-yellow-500" />, trend: '↑ 3%' },
          { label: 'Monthly Revenue', value: dashboardStats.monthlyRevenue, icon: <Activity className="h-12 w-12 text-purple-500" />, trend: '↑ 15%' }
        ].map(({ label, value, icon, trend }, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
              {icon}
            </div>
            <p className="text-xs text-green-600 mt-2">{trend} from last month</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <UserPlus className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">New user Sarah Johnson registered</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Sprout className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">Farm #12 updated crop rotation schedule</span>
            <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-700">Monthly harvest report generated</span>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
        </div>
      </div>
    </div>

  );

  // Users Tab
  const renderUserManagement = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/userdetails')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>User Management</span>
          </button>

          <button
            onClick={() => navigate('/adduser')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['User', 'Role', 'Farm Details', 'Status', 'Last Login', 'Actions'].map((header, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName || user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.farmArea || 'N/A'}</div>
                      <div className="text-gray-500">
                        {user.crops ? user.crops.join(', ') : 'No crops assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status || 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleViewUser(user)} className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => navigate(`/userdetails/${user._id}`)} className="text-green-600 hover:text-green-900 p-1 rounded">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900 p-1 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      default:
        return renderDashboard();
    }
  };

  return (
     <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-green-600">
            <Sprout className="h-8 w-8 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Farm Nex Admin</h2>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src={adminData.avatar} alt="Admin" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{adminData.name}</p>
                <p className="text-xs text-gray-500 truncate">{adminData.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </button>

            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <Users className="mr-3 h-5 w-5" />
              User Management
            </button>

            <button onClick={() => navigate('/adduser')} className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Plus className="mr-3 h-5 w-5" />
              Add User
            </button>

            <button onClick={() => navigate('/settings')} className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button>
            
            <button
             onClick={() => navigate('/adminqa')}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <MessageSquare  className="mr-3 h-5 w-5" />
                 Q&A Inbox
              </button>
            
            <button
             onClick={() => navigate('/analytics')}
             className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                  <BarChart className="mr-3 h-5 w-5" />
              Analytics
          </button>


          </nav>

          <div className="p-4 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{renderContent()}</div>
      </main>


      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">User Details</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-4">
              {['Name', 'Email', 'Role', 'Farm Area', 'Crops', 'Status', 'Last Login'].map((label, i) => (
                <div key={i}>
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <p className="text-gray-900">
                    {label === 'Name' && (selectedUser.fullName || selectedUser.name)}
                    {label === 'Email' && selectedUser.email}
                    {label === 'Role' && selectedUser.role}
                    {label === 'Farm Area' && (selectedUser.farmArea || 'N/A')}
                    {label === 'Crops' && (selectedUser.crops ? selectedUser.crops.join(', ') : 'No crops assigned')}
                    {label === 'Status' && (selectedUser.status || 'Inactive')}
                    {label === 'Last Login' && (selectedUser.lastLogin || 'N/A')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;