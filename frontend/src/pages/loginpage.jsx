import axios from "axios";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FormValidator, ValidationRules } from '../utils/validation';
import { showError, showSuccess, showLoading } from '../utils/sweetAlert';
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear previous error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const validator = new FormValidator();
    
    // Email validation
    validator.required(formData.email, 'Email')
             .email(formData.email, 'Email');
    
    // Password validation
    validator.required(formData.password, 'Password')
             .minLength(formData.password, 6, 'Password');

    const validationErrors = validator.getAllErrors();
    setErrors(validationErrors);
    
    return !validator.hasErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      await showError('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show loading dialog
      const loadingAlert = showLoading('Signing In', 'Please wait while we verify your credentials...');
      
      const response = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/user/login", {
        email: formData.email,
        password: formData.password,
      });
      
      // Close loading dialog
      if (loadingAlert && typeof loadingAlert.close === 'function') {
        loadingAlert.close();
      }
      
      console.log("Login successful:");
      localStorage.setItem("token", response.data.token);
      
      await showSuccess('Login Successful!', 'Welcome back to FarmNex!');
      
      // Navigate based on user role
      const userRole = response.data.user.role;
      console.log("User role:", userRole);
      
      if (userRole === "admin") {
        navigate("/admin/");
      } else if (userRole === "farmer") {
        navigate("/farmer/dashboard");
      } else {
        navigate("/home");
      }
      
    } catch (error) {
      console.error("Login failed:", error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.response && error.response.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      await showError('Login Failed', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="text-green-600">Crop</span>Cart
        </h1>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left side - Branding */}
        <div className="hidden lg:block bg-green-600 p-12 flex flex-col justify-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
            <p className="text-lg opacity-90">
              Access your account to shop the freshest fruits and vegetables in town.
            </p>
          </div>
          <div className="mt-12">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Fresh produce"
              className="rounded-lg shadow-lg object-cover h-48 w-full"
            />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="p-8 sm:p-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
            <p className="mt-2 text-gray-600">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-lg ${
                  errors.Email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="your@email.com"
              />
              {errors.Email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.Email[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-lg ${
                  errors.Password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="••••••••"
              />
              {errors.Password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.Password[0]}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-6 w-full inline-flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition text-lg ${
                isSubmitting 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <a
              href="#"
              className="mt-6 w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition text-lg"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
);
}
