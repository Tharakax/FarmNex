
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

const CustomerDashboard = () => {
  const navigate = useNavigate(); 
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartItems, setCartItems] = useState(3);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [user] = useState({
    name: 'Umar Ahmed',
    email: 'umar.ahmed@email.com',
    phone: '+94 77 123 4567',
    address: 'No 123, Main Street, Colombo 03',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const mockProducts = [
    { id: 1, name: 'Organic Tomatoes', price: 450, unit: 'kg', farm: 'Green Valley Farm', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop', category: 'vegetables', organic: true },
    { id: 2, name: 'Fresh Milk', price: 200, unit: 'liter', farm: 'Dairy Dreams', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop', category: 'dairy', organic: false },
    { id: 3, name: 'Farm Eggs', price: 350, unit: 'dozen', farm: 'Happy Hens Farm', image: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=200&h=200&fit=crop', category: 'poultry', organic: true },
    { id: 4, name: 'Organic Carrots', price: 300, unit: 'kg', farm: 'Root Paradise', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop', category: 'vegetables', organic: true },
  ];

  const mockOrders = [
    { id: 'ORD-001', date: '2025-07-20', total: 1250, status: 'Delivered', items: 3 },
    { id: 'ORD-002', date: '2025-07-18', total: 850, status: 'Shipped', items: 2 },
    { id: 'ORD-003', date: '2025-07-15', total: 650, status: 'Processing', items: 1 },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/'); 
    }
  };

  const addToCart = (productId) => {
    setCartItems(prev => prev + 1);
    alert('Product added to cart!');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'products', label: 'Browse Products', icon: Apple },
    { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart, badge: cartItems },
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
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 🌾</h2>
        <p className="opacity-90">Discover fresh farm products delivered straight to your door</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Cart Items</p>
              <p className="text-2xl font-bold text-gray-900">{cartItems}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">Rs. 4,250</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {mockOrders.slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Rs. {order.total}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
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
    navigate('/products')
  );

  const renderOrders = () => (
    navigate("/myorders")
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'products': return renderProducts();
      case 'cart': return (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shopping Cart</h3>
          <p className="text-gray-600">You have {cartItems} items in your cart</p>
          <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
            Proceed to Checkout
          </button>
        </div>
      );
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
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback & Ratings</h3>
          <p className="text-gray-600">Rate your purchases and share feedback</p>
        </div>
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
    </div>
  );
};

export default CustomerDashboard
