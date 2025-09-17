import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });

    // Clear errors when user starts typing
    if (errors[name]) {
      const newError = name === "email" ? validateEmail(value) : validatePassword(value);
      setErrors({ ...errors, [name]: newError });
    }
  };

  const validateAllFields = () => {
    const newErrors = {
      email: validateEmail(inputs.email),
      password: validatePassword(inputs.password)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Login with credentials and get OTP sent
      const response = await axios.post("http://localhost:3000/users/login", {
  email: inputs.email.trim().toLowerCase(),
  password: inputs.password,
});

      console.log('Login response:', response.data);

      if (response.data.success && response.data.user) {
        const { user } = response.data;

        // Store user info for OTP verification
        localStorage.setItem("pendingUserEmail", user.email);
        localStorage.setItem("pendingUserId", user._id);
        localStorage.setItem("pendingUserRole", user.role);

        // Clear any existing auth tokens
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");

        //alert("OTP sent to your email. Please check your inbox.");
        toast.success("OTP sent to your email. Please check your inbox.");
        navigate("/otp");
      } else {
        throw new Error(response.data.message || "Login failed");
      }

    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message = err.response.data?.message;
        
        if (status === 401) {
          errorMessage = "Invalid email or password";
          setErrors({ password: "Invalid credentials" });
        } else if (status === 404) {
          errorMessage = "User not found";
          setErrors({ email: "User not found" });
        } else if (message) {
          errorMessage = message;
        }
      } else if (err.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your FarmNex account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.email ? 'border-red-300 bg-red-50 focus:border-red-400' :
                    inputs.email && !errors.email ? 'border-green-300 bg-green-50 focus:border-green-400' : 
                    'border-gray-200 focus:border-green-400'
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
                {inputs.email && !errors.email && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={inputs.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                    errors.password ? 'border-red-300 bg-red-50 focus:border-red-400' :
                    inputs.password && !errors.password ? 'border-green-300 bg-green-50 focus:border-green-400' : 
                    'border-gray-200 focus:border-green-400'
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="text-right">
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')} 
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
                disabled={isSubmitting}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              disabled={isSubmitting}
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;