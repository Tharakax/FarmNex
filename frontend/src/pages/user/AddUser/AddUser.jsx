import React, { useState } from 'react';
import { 
  User, Mail, Phone, Calendar, Lock, MapPin, UserCheck, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, UserPlus,
  Home, Users, Settings, BarChart3, Tractor, Sprout, Package, Bell, Menu, MessageSquare
} from 'lucide-react';
import axios from 'axios';
// Smart Farm Sidebar Navigation Component
function SmartFarmSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin', active: true },
    { icon: Tractor, label: 'Farm Operations', path: '/farm-operations' },
    { icon: Sprout, label: 'Crop Monitor', path: '/crops' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: MessageSquare, label: 'Q&A Inbox', path: '/inbox' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r-2 border-green-100 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-green-100">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FarmNex</h1>
              <p className="text-xs text-green-600 font-medium">Management System</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                item.active 
                  ? 'bg-green-100 text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                item.active ? 'text-green-700' : 'text-gray-500 group-hover:text-green-600'
              }`} />
              {!isCollapsed && (
                <span className="transition-opacity duration-200">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-100">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">Farm Administrator</p>
            </div>
          )}
          <button 
            className={`p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors relative ${
              isCollapsed ? 'mt-2' : ''
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Top Header Component
function TopHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        <p className="text-sm text-gray-600">Manage farm users and their roles</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </header>
  );
}

function AddUser() {
  const [inputs, setInputs] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    username: "",
    password: "",
    role: "FarmStaff",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Full name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  //phone number
  const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";

  // Valid Sri Lankan mobile prefixes after +94
  const phoneRegex = /^\+94(71|75|76|77|78)\d{7}$/;
  if (!phoneRegex.test(phone)) {
    return "Phone number must start with +94 followed by a valid mobile prefix (e.g., +94771234567)";
  }

  // Prevent repeated digits like 1111111
  const repeatedDigits = /^(\d)\1{6}$/; // 7 repeating digits
  const numberPart = phone.slice(5); // Skip +94xx
  if (repeatedDigits.test(numberPart)) {
    return "Phone number cannot be a sequence of repeated digits";
  }

  return "";
};

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const numAge = parseInt(age);
    if (isNaN(numAge)) return "Age must be a valid number";
    if (numAge < 18) return "User must be at least 18 years old";
    if (numAge > 120) return "Please enter a valid age";
    return "";
  };

  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character (@$!%*?&)";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'age':
        return validateAge(value);
      case 'username':
        return validateUsername(value);
      case 'password':
        return validatePassword(value);
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for age - only allow positive numbers
    if (name === 'age') {
      const numValue = value.replace(/[^0-9]/g, '');
      setInputs({ ...inputs, [name]: numValue });
      
      // Clear error when user starts typing correctly
      if (errors[name]) {
        const error = validateField(name, numValue);
        setErrors({ ...errors, [name]: error });
      }
      return;
    }

    setInputs({ ...inputs, [name]: value });

    // Real-time validation
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateAllFields = () => {
    const newErrors = {};
    
    newErrors.fullName = validateFullName(inputs.fullName);
    newErrors.email = validateEmail(inputs.email);
    newErrors.phone = validatePhone(inputs.phone);
    newErrors.age = validateAge(inputs.age);
    newErrors.username = validateUsername(inputs.username);
    newErrors.password = validatePassword(inputs.password);

    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== "");
  };

  const showMessage = (message, type = 'success') => {
    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-500';
    const icon = type === 'success' 
      ? '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>'
      : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>';
    
    messageDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    messageDiv.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${icon}
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv);
      }
    }, 5000);
  };

  const sendRequest = async () => {
  const apiUrl = 'http://localhost:3000/users'; 

  try {
    const response = await axios.post(apiUrl, inputs); 
    return response;
  } catch (error) {
    throw error; 
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all fields first
  if (!validateAllFields()) return;

  setIsSubmitting(true);

  try {
    const response = await sendRequest();
    showMessage(response.data.message || "User added successfully!", 'success');

    // Reset form and navigate back after successful submission
    setTimeout(() => {
      setInputs({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        username: "",
        password: "",
        role: "FarmStaff",
        address: ""
      });
      setErrors({});
      window.location.href = '/admin';
    }, 1500);

  } catch (err) {
    const errorMsg = err.response?.data?.message || "Failed to create user";
    showMessage(errorMsg, 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleBack = () => {
    window.location.href = '/admin';
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    
    const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-green-600'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return { strength, color: colors[strength - 1] || 'bg-gray-300', label: labels[strength - 1] || 'Too Short' };
  };

  const passwordStrength = getPasswordStrength(inputs.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      <SmartFarmSidebar />
      
      <div className="flex-1 ml-64">
        <TopHeader />
        
        <div className="py-12 px-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <button 
                onClick={handleBack}
                className="inline-flex items-center text-green-700 hover:text-green-800 mb-6 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to User Management
              </button>
              
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Farm User</h2>
              <p className="text-gray-600">Create a new user account for the smart farm system</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={inputs.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.fullName 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : inputs.fullName && !errors.fullName
                          ? 'border-green-300 focus:border-green-600 bg-green-50'
                          : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {inputs.fullName && !errors.fullName && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {errors.fullName && (
                    <div className="flex items-center text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fullName}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={inputs.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : inputs.email && !errors.email
                          ? 'border-green-300 focus:border-green-600 bg-green-50'
                          : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {inputs.email && !errors.email && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {errors.email && (
                    <div className="flex items-center text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" name="phone" value={inputs.phone} onChange={handleChange} 
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : inputs.phone && !errors.phone
                          ? 'border-green-300 focus:border-green-600 bg-green-50'
                          : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                      }`}
                      placeholder="Enter phone number-(e.g., +94771234567)"
                    />
                    {inputs.phone && !errors.phone && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {errors.phone && (
                    <div className="flex items-center text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </div>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Age *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="age"
                      value={inputs.age}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.age 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : inputs.age && !errors.age
                          ? 'border-green-300 focus:border-green-600 bg-green-50'
                          : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                      }`}
                      placeholder="Enter age (18+)"
                    />
                    {inputs.age && !errors.age && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {errors.age && (
                    <div className="flex items-center text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.age}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={inputs.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.username 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : inputs.username && !errors.username
                          ? 'border-green-300 focus:border-green-600 bg-green-50'
                          : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                      }`}
                      placeholder="Choose a username"
                    />
                    {inputs.username && !errors.username && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {errors.username && (
                    <div className="flex items-center text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.username}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={inputs.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : inputs.password && !errors.password
                          ? 'border-green-300 focus:border-green-600 bg-green-50'
                          : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {inputs.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Password strength:</span>
                        <span className={`font-medium ${passwordStrength.strength >= 4 ? 'text-green-700' : passwordStrength.strength >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <div className="flex items-center text-red-600 text-sm animate-pulse">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Farm Role *
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="role"
                      value={inputs.role}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hover:border-gray-300 transition-all duration-300 bg-white appearance-none"
                    >
                      <option value="FarmStaff">Farm Staff</option>
                      <option value="Admin">Farm Administrator</option>
                      <option value="Manager">Farm Manager</option>
                      <option value="DeliveryStaff">Delivery Staff</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="address"
                      rows="3"
                      value={inputs.address}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hover:border-gray-300 transition-all duration-300 resize-none"
                      placeholder="Enter address (optional)"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding User...
                      </div>
                    ) : (
                      'Add User to Farm'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUser;