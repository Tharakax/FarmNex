import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'react-toastify';


const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();

  // Initialize component and check for pending email
  useEffect(() => {
    console.log("OTP Verification Component Mounted");
    const email = localStorage.getItem("pendingUserEmail");
    console.log("Pending Email:", email);
    
    if (!email) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }
    
    setPendingEmail(email);
  }, [navigate]);

  // Resend OTP cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Clear error when user types
  useEffect(() => {
    if (error && otp) {
      setError("");
    }
  }, [otp, error]);

  const handleVerifyOTP = async () => {
    const cleanOtp = otp.replace(/\D/g, '').trim();
    
    if (cleanOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!pendingEmail) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Verifying OTP:", { email: pendingEmail, otp: cleanOtp });

      const response = await axios.post(
        "http://localhost:3000/users/verifyOTP", 
        { 
          email: pendingEmail, 
          otp: cleanOtp 
        },
        { 
          headers: { 
            'Content-Type': 'application/json' 
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("OTP Verification Response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;
        
        if (!token || !user) {
          throw new Error("Invalid response from server");
        }

        // Store authentication data
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user._id || user.id);
        localStorage.setItem("userName", user.name || user.fullName);
        
        // Clean up pending data
        localStorage.removeItem("pendingUserEmail");
        localStorage.removeItem("pendingUserId");
        localStorage.removeItem("pendingUserRole");

        console.log("Login successful, redirecting to:", user.role);

        // Redirect based on role
        const roleRoutes = {
          Admin: "/admin",
          FarmStaff: "/farmstaff-dashboard",
          Manager: "/manager-dashboard",
          DeliveryStaff: "/delivery-dashboard",
          Customer: "/customerdash"
        };
        
        const redirectPath = roleRoutes[user.role] || "/";
        navigate(redirectPath, { replace: true });
        
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
      
    } catch (error) {
      console.error("OTP Verification Error:", error);
      
      let errorMessage = "Verification failed. Please try again.";
      
      if (error.response) {
        const { status, data } = error.response;
        console.log("Error response:", { status, data });
        
        if (data?.message) {
          errorMessage = data.message;
        } else if (status === 400) {
          errorMessage = "Invalid or expired OTP. Please try again.";
        } else if (status === 404) {
          errorMessage = "User not found. Please login again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
        
        // Handle specific error codes
        if (data?.code === "OTP_EXPIRED") {
          errorMessage = "OTP has expired. Please request a new one.";
        } else if (data?.code === "INVALID_OTP") {
          errorMessage = "Invalid OTP. Please check and try again.";
        } else if (data?.code === "NO_OTP") {
          errorMessage = "No OTP found. Please request a new one.";
        }
        
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Clear OTP field for invalid OTP
      if (errorMessage.includes("Invalid OTP") || errorMessage.includes("expired")) {
        setOtp("");
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    if (!pendingEmail) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setResendLoading(true);
      setError("");

      console.log("Resending OTP to:", pendingEmail);

      const response = await axios.post(
        "http://localhost:3000/users/login-otp-step1", 
        { email: pendingEmail },
        { 
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("Resend OTP Response:", response.data);

      if (response.data.success || response.status === 200) {
        //alert("New OTP sent successfully! Please check your email.");
        toast.success("New OTP sent successfully! Please check your email.");
        setResendCooldown(60); // 60 second cooldown
        setOtp(""); // Clear current OTP
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
      
    } catch (error) {
      console.error("Resend OTP Error:", error);
      
      let errorMessage = "Failed to resend OTP. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    // Clear pending data
    localStorage.removeItem("pendingUserEmail");
    localStorage.removeItem("pendingUserId");
    localStorage.removeItem("pendingUserRole");
    navigate("/login");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setOtp(value.slice(0, 6)); // Limit to 6 digits
  };

   // Auto-submit when 6 digits entered (with debounce)
  useEffect(() => {
    if (otp.length === 6 && !loading && !error) {
      const timer = setTimeout(() => {
        handleVerifyOTP();
      }, 1500); // 500ms delay to prevent accidental submissions
      
      return () => clearTimeout(timer);
    }
  }, [otp, loading, error]);





  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <button 
            onClick={handleBack}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
            disabled={loading || resendLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your OTP</h2>
          <p className="text-gray-600 mb-2">
            Enter the 6-digit verification code
          </p>
          {pendingEmail && (
            <div className="flex items-center justify-center text-sm text-green-600">
              <Mail className="w-4 h-4 mr-1" />
              sent to {pendingEmail}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 text-center">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                placeholder="000000"
                className={`w-full border-2 rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-widest focus:outline-none transition-all duration-300 ${
                  error ? 'border-red-300 bg-red-50' :
                  otp.length === 6 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                } focus:border-green-400`}
                inputMode="numeric"
                autoFocus
                disabled={loading || resendLoading}
              />
              <div className="text-center text-xs text-gray-500">
                {otp.length}/6 digits entered
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                loading || otp.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            {/* Resend Button */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={resendLoading || resendCooldown > 0}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  resendLoading || resendCooldown > 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              <p>Check your spam folder if you don't see the email.</p>
              <p className="mt-1">The code expires in 10 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;