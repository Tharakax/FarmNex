import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, User, Mail, Phone, Calendar, MapPin, UserCheck, ArrowLeft, CheckCircle, AlertCircle, Save, X } from 'lucide-react';

function UpdateUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inputs, setInputs] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    username: "",
    role: "",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validation functions (same as Register.js but excluding password validation)
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
    if (numAge < 18) return "You must be at least 18 years old";
    if (numAge > 100) return "Please enter a valid age";
    return "";
  };

  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
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
      default:
        return "";
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3000/users/${id}`);
        setInputs(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        // Show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            Failed to load user data
          </div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
          document.body.removeChild(errorDiv);
          navigate('/userdetails');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHandler();
  }, [id, navigate]);

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

    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.put(`http://localhost:3000/users/${id}`, {
        fullName: inputs.fullName,
        email: inputs.email.toLowerCase(),
        phone: inputs.phone,
        age: Number(inputs.age),
        username: inputs.username,
        role: inputs.role,
        address: inputs.address
      });

      // Show success message with animation
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      successDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          User updated successfully!
        </div>
      `;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.style.transform = 'translateX(0)';
      }, 100);

      setTimeout(() => {
        navigate("/userdetails");
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update user";
      
      // Show error message with animation
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      errorDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          ${errorMsg}
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
      }, 100);

      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 5000);

    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/userdetails')}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to User Details
          </button>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Update User</h2>
          <p className="text-gray-600">Modify user information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
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
                  value={inputs.fullName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                  placeholder="Full name (read-only)"
                />
              </div>
              <p className="text-xs text-gray-500">Full name cannot be modified</p>
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
                  value={inputs.email || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                  placeholder="Email address (read-only)"
                />
              </div>
              <p className="text-xs text-gray-500">Email cannot be modified</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={inputs.phone || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : inputs.phone && !errors.phone
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Enter phone number-(eg:+94771234567)"
                />
                {inputs.phone && !errors.phone && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
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
                  value={inputs.age || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.age 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : inputs.age && !errors.age
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Enter your age (18+)"
                />
                {inputs.age && !errors.age && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
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
                  value={inputs.username || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : inputs.username && !errors.username
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
                {inputs.username && !errors.username && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.username && (
                <div className="flex items-center text-red-600 text-sm animate-pulse">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Role *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="role"
                  value={inputs.role || ""}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed appearance-none"
                  disabled
                >
                  <option value="FarmStaff">Farm Staff</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="DeliveryStaff">Delivery Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">Role cannot be modified</p>
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
                  value={inputs.address || ""}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hover:border-gray-300 transition-all duration-300 resize-none"
                  placeholder="Enter your address (optional)"
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
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" />
                    Update User
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/userdetails')}
                className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUser;