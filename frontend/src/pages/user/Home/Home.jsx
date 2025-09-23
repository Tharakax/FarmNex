
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // 
import {
  ShoppingCart, 
  Package, 
  Truck, 
  CreditCard, 
  Star, 
  Settings, 
  HelpCircle, 
  Bell, 
  Search, 
  Home, 
  Apple, 
  DollarSign, 
  LogOut, 
  Edit3, 
  Lock,
  Menu,
  X,
  MessageSquare ,
  Grid,
  List,
  Download,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import DashboardFeedbackForm from '../../../components/dashboard/DashboardFeedbackForm';
import DashboardFeedbackList from '../../../components/dashboard/DashboardFeedbackList';
import DashboardBrowseProducts from '../../../components/dashboard/DashboardBrowseProducts';
import DashboardShoppingCart from '../../../components/dashboard/DashboardShoppingCart';
import { getLoggedInUser } from '../../../utils/userUtils';
import { getCart } from '../../../utils/cart';
import { orderAPI } from '../../../services/orderAPI';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const navigate = useNavigate(); 
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    thisMonthSpending: 0,
    recentOrders: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [user, setUser] = useState({
    name: 'Loading...',
    email: '',
    phone: '+94 77 123 4567', // Default placeholder
    address: 'No 123, Main Street, Colombo 03', // Default placeholder
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  // Load real user data from authentication
  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    console.log('Logged in user data:', loggedInUser); // Debug log
    
    if (loggedInUser && loggedInUser.name !== 'Anonymous User') {
      setUser(prevUser => ({
        ...prevUser,
        name: loggedInUser.name,
        email: loggedInUser.email,
        id: loggedInUser.id,
        role: loggedInUser.role
      }));
      setIsLoading(false);
    } else {
      // If no valid user found, redirect to login
      console.warn('No valid user found, redirecting to login');
      setTimeout(() => {
        navigate('/login');
      }, 1000); // Small delay to show loading state
    }
  }, [navigate]);

  // Load cart count from localStorage and set up periodic updates
  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(totalItems);
    };

    // Initial load
    updateCartCount();

    // Set up interval to check for cart changes every 500ms
    const interval = setInterval(updateCartCount, 500);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Load dashboard statistics from API
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const result = await orderAPI.getDashboardStats();
        
        if (result.success) {
          setDashboardStats(result.stats);
        } else {
          console.error('Failed to load dashboard stats:', result.error);
          // Don't show error toast for stats as it's not critical
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    // Only load stats if user is authenticated
    if (!isLoading && user.name !== 'Loading...') {
      loadDashboardStats();
    }
  }, [isLoading, user.name]);

  // Removed mock data - now using real data from APIs

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('pendingUserEmail');
      localStorage.removeItem('pendingUserId');
      localStorage.removeItem('pendingUserRole');
      
      // Navigate to home page
      navigate('/'); 
    }
  };

  const addToCart = (productId) => {
    // This function is now handled by the DashboardBrowseProducts component
    // Cart count will be automatically updated by the useEffect hook
  };

  // Handle feedback form submission success
  const handleFeedbackSubmitSuccess = () => {
    // Force refresh of feedback list by triggering a re-render
    // In a real app, you might use a context or state management library
    window.location.reload(); // Simple approach for demo
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'products', label: 'Browse Products', icon: Apple },
    { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart, badge: cartItemCount > 0 ? cartItemCount : null },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'delivery', label: 'Track Delivery', icon: Truck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'feedback', label: 'Feedback & Ratings', icon: Star },
    { id: 'qna', label: 'Q&A Section', icon: MessageSquare },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user.name === 'Loading...' ? 'User' : user.name}! 🌾
        </h2>
        <p className="opacity-90">Discover fresh farm products delivered straight to your door</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Orders</p>
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
              )}
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Cart Items</p>
              <p className="text-2xl font-bold text-gray-900">{cartItemCount}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">This Month</p>
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">Rs. {dashboardStats.thisMonthSpending.toFixed(2)}</p>
              )}
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {statsLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="bg-gray-200 h-4 w-20 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gray-200 h-4 w-16 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 w-12 rounded"></div>
                  </div>
                </div>
              ))
            ) : dashboardStats.recentOrders.length > 0 ? (
              dashboardStats.recentOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rs. {order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Delivered' || order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' || order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Processing' || order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
                <p className="text-sm">Start shopping to see your orders here</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveTab('products')}
              className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Apple className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Browse Products</p>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Track Orders</p>
            </button>
            <button 
              onClick={() => setActiveTab('cart')}
              className="p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium">View Cart</p>
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Get Help</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <DashboardBrowseProducts />
  );

  const renderOrders = () => (
    navigate("/myorders")
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'products': return renderProducts();
      case 'cart': return (<DashboardShoppingCart onBrowseProducts={() => setActiveTab('products')} />);
      case 'orders': return renderOrders();
      case 'delivery': return (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Delivery</h3>
          <p className="text-gray-600">Real-time delivery tracking coming soon</p>
        </div>
      );
      case 'payments': return (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment History</h3>
          <p className="text-gray-600">View your payment history and receipts</p>
        </div>
      );
      case 'feedback': return (
        <DashboardFeedbackList 
          user={user} 
          onNewFeedback={() => setShowFeedbackForm(true)}
        />
      );
      case 'qna': return (
         <div className="text-center py-12">
           <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Q&A Section</h3>
          <p className="text-gray-600">Post questions and get answers from the community.</p>
           <button 
            onClick={() => navigate('/userqa')} 
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
          Ask a Question
          </button>
          </div>
        );

      case 'support': return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold mb-4">Contact Support</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span>+94 76 926 0109</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span>support@smartfarm.lk</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">Return/Refund Request</button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">Report Issue</button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">FAQ</button>
              </div>
            </div>
          </div>
        </div>
      );
      default: return renderOverview();
    }
  };

  // Show loading spinner while authenticating user
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h2 className="text-xl font-bold text-green-600">🌾 Farm Nex</h2>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block font-medium text-gray-700">{user.name}</span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button 
                   onClick={() => {
                setShowUserDropdown(false);
                 navigate('/userprofile'); 
                }}
                 className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg"
                   >
                 <Edit3 className="w-4 h-4" />
             Edit Profile
                      </button>
                      <button 
                        onClick={() => {
                          setShowUserDropdown(false);
                          navigate('/changepassword');
                        }}
                        className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg"
                      >
                        <Lock className="w-4 h-4" />
                        Change Password
                      </button>
                      <button 
                        onClick={() => {
                          setShowUserDropdown(false);
                          navigate('/profile/settings');
                        }}
                        className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-3 text-left hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className={`md:w-64 ${showMobileMenu ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <nav className="space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Form Modal */}
      <DashboardFeedbackForm 
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSubmitSuccess={handleFeedbackSubmitSuccess}
        user={user}
      />
    </div>
  );
};

export default CustomerDashboard
