import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Settings, User, ChevronDown, Sprout, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../features/notifications/NotificationBell';

const AdminHeader = ({ 
  title = "Admin Dashboard", 
  subtitle = "Manage your Farm Nex system", 
  showBackButton = false, 
  backButtonText = "Back", 
  backButtonPath = "/", 
  showSearch = false,
  className = "" 
}) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current admin user data
  const [adminData, setAdminData] = useState({
    name: "Admin User",
    email: "admin@farmnex.com",
    avatar: null
  });

  useEffect(() => {
    // Load admin user data from localStorage or JWT token
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setAdminData({
          name: user.name || user.fullName || 'Admin User',
          email: user.email || 'admin@farmnex.com',
          avatar: user.avatar || user.profileImage
        });
      } else {
        // Try JWT token
        const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setAdminData({
              name: payload.name || payload.fullName || 'Admin User',
              email: payload.email || 'admin@farmnex.com',
              avatar: payload.avatar
            });
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const handleBackClick = () => {
    navigate(backButtonPath);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <header className={`bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200 ${className}`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">{backButtonText}</span>
              </button>
            )}
            
            {/* Logo and Farm Nex Brand - only show when no back button */}
            {!showBackButton && (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Farm Nex</span>
              </div>
            )}
          </div>

          {/* Center Section - Search (if enabled) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search Icon for Mobile */}
            {showSearch && (
              <button className="md:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    {adminData.avatar ? (
                      <img 
                        src={adminData.avatar} 
                        alt="Admin" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {adminData.name}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfileDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{adminData.name}</p>
                      <p className="text-xs text-gray-500">{adminData.email}</p>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={() => {navigate('/profile'); setShowProfileDropdown(false);}}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </button>
                      <button 
                        onClick={() => {navigate('/settings'); setShowProfileDropdown(false);}}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <X className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;