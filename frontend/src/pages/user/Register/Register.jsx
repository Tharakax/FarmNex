import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, User, Mail, Phone, Calendar, Lock, MapPin, UserCheck, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

function Register() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Full name can only contain letters and spaces";
    return "";
  };
//email validtaion
  const validateEmail = (email) => {
  if (!email) return "Email is required";

  // Disallow capital letters
  if (/[A-Z]/.test(email)) return "Email must be in lowercase";

  // Validate email format
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
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

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character (@$!%*?&)";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
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
      case 'confirmPassword':
        return validateConfirmPassword(value, inputs.password);
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

    // Special case for confirm password when password changes
    if (name === 'password' && inputs.confirmPassword) {
      const confirmError = validateConfirmPassword(inputs.confirmPassword, value);
      setErrors({ ...errors, [name]: "", confirmPassword: confirmError });
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
    newErrors.confirmPassword = validateConfirmPassword(inputs.confirmPassword, inputs.password);

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
      await axios.post("http://localhost:3000/users", {
        fullName: inputs.fullName,
        email: inputs.email,
        phone: inputs.phone,
        age: Number(inputs.age),
        username: inputs.username,
        password: inputs.password,
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
          Registration successful!
        </div>
      `;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.style.transform = 'translateX(0)';
      }, 100);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      
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

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    
    const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-green-500'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return { strength, color: colors[strength - 1] || 'bg-gray-300', label: labels[strength - 1] || 'Too Short' };
  };

  const passwordStrength = getPasswordStrength(inputs.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join FarmNex</h2>
          <p className="text-gray-600">Create your account to start smart farming</p>
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
                  value={inputs.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.fullName 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : inputs.fullName && !errors.fullName
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {inputs.fullName && !errors.fullName && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
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
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Enter your Valid email "
                />
                {inputs.email && !errors.email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
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
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={inputs.phone}
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
                  value={inputs.age}
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
                  value={inputs.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : inputs.username && !errors.username
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Choose a username"
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
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
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
                    <span className={`font-medium ${passwordStrength.strength >= 4 ? 'text-green-600' : passwordStrength.strength >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={inputs.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : inputs.confirmPassword && !errors.confirmPassword && inputs.password
                      ? 'border-green-300 focus:border-green-500 bg-green-50'
                      : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center text-red-600 text-sm animate-pulse">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
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
                  value={inputs.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 hover:border-gray-300 transition-all duration-300 bg-white appearance-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="DeliveryStaff">Delivery Staff</option>
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
                  placeholder="Enter your address (optional)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;