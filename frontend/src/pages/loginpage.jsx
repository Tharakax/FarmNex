import axios from "axios";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted!"); 
    console.log("Email:", email);
    console.log("Password:", password);


    axios.post(import.meta.env.VITE_BACKEND_URL+"/api/user/login", {
        email: email,
        password: password,
        }).then((response) => {
          console.log("Login successful:");
          localStorage.setItem("token", response.data.token);
          toast.success("Login successful!");

          
          console.log("Response data:", response.data.user.role);
          if(response.data.user.role === "admin") {
            navigate("/admin/");
          }else if(response.data.user.role === "farmer") {
            navigate("/farmer/dashboard");
          }else{
            navigate("/home");
          }
        }).catch((error) => {
          console.error("Login failed:", error);
          toast.error("Login failed. Please check your credentials.");
          // Handle login failure, e.g., show an error message
        })
    
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
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-lg"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                onChange ={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-lg"
                placeholder="••••••••"
              />
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
              className="mt-6 w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition text-lg"
            >
              Sign In
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
