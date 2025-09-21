import React from 'react';
import { Link, Routes, Route, Outlet } from 'react-router-dom';
import ProductManagement from '../components/products/ProductManagement.jsx';
import ReportsManagement from '../components/reports/ReportsManagement.jsx';

const Dashboard = () => {
  return (
    <div className="flex w-screen h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Sidebar */}
      <div className="bg-gradient-to-b from-green-800 to-emerald-900 text-white w-64 px-4 py-8 shadow-2xl">
        <div className="flex items-center mb-8">
          
          <div>
            <h1 className="text-xl font-bold">CropCart</h1>
            <p className="text-green-200 text-sm">Admin Panel</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/admin" className="flex items-center p-3 rounded-lg hover:bg-green-700/50 transition-all duration-200 group">
                <div className="bg-green-600/30 p-2 rounded-lg mr-3 group-hover:bg-green-600/50 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="flex items-center p-3 rounded-lg hover:bg-green-700/50 transition-all duration-200 group">
                <div className="bg-green-600/30 p-2 rounded-lg mr-3 group-hover:bg-green-600/50 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="font-medium">Farmers</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="flex items-center p-3 rounded-lg hover:bg-green-700/50 transition-all duration-200 group">
                <div className="bg-green-600/30 p-2 rounded-lg mr-3 group-hover:bg-green-600/50 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="font-medium">Crops</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/analytics" className="flex items-center p-3 rounded-lg hover:bg-green-700/50 transition-all duration-200 group">
                <div className="bg-green-600/30 p-2 rounded-lg mr-3 group-hover:bg-green-600/50 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium">Analytics</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/reports" className="flex items-center p-3 rounded-lg hover:bg-green-700/50 transition-all duration-200 group">
                <div className="bg-green-600/30 p-2 rounded-lg mr-3 group-hover:bg-green-600/50 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium">Reports</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="flex items-center p-3 rounded-lg hover:bg-green-700/50 transition-all duration-200 group">
                <div className="bg-green-600/30 p-2 rounded-lg mr-3 group-hover:bg-green-600/50 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Organic Badge */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-center">
          <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-white">100% Organic</p>
          <p className="text-xs text-green-200">Certified Fresh</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-green-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Farm Dashboard</h2>
                <p className="text-sm text-green-600">Manage your organic harvest</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center bg-green-50 rounded-full p-1">
                <img className="w-8 h-8 rounded-full border-2 border-green-200" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
                <div className="ml-2 mr-3">
                  <p className="text-sm font-medium text-gray-700">John Doe</p>
                  <p className="text-xs text-green-600">Farm Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
          <Routes path="/admin/*">
            {/* Nested routes for admin dashboard */}
            <Route path="/" element={
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Fresh Harvest Admin</h1>
                  <p className="text-gray-600 max-w-md mx-auto">Manage your organic farm operations, track crop inventory, and connect with customers who value fresh, sustainable produce.</p>
                </div>
              </div>
            } />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/reports" element={<ReportsManagement />} />
            <Route path="/users" element={
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Farmer Management</h2>
                <p className="text-gray-600">Manage registered farmers and their profiles.</p>
              </div>
            } />
            <Route path="/analytics" element={
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Farm Analytics</h2>
                <p className="text-gray-600">Track crop performance, sales metrics, and seasonal trends.</p>
              </div>
            } />
            <Route path="/settings" element={
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Farm Settings</h2>
                <p className="text-gray-600">Configure your farm preferences and system settings.</p>
              </div>
            } />


      
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;