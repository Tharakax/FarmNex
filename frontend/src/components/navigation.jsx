import React, { useState, useEffect } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiHeart, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { FaLeaf, FaGraduationCap, FaBook, FaPlus, FaEye } from 'react-icons/fa';
import HomePage from '../pages/homePage.jsx';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isTrainingDropdownOpen, setIsTrainingDropdownOpen] = useState(false);
  const Navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full h-24 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2 border-b border-green-100' 
          : 'bg-gradient-to-r from-white/90 to-green-50/80 backdrop-blur-sm py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Enhanced Animation */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <FaLeaf className="h-8 w-8 text-green-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-green-500" />
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-0 group-hover:opacity-20 transform scale-0 group-hover:scale-150 transition-all duration-300"></div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-green-400 transition-all duration-300">
                  CropCart
                </span>
              </Link>
            </div>

            {/* Desktop Navigation with Enhanced Styling */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              <div className="flex space-x-1">
                <NavLink 
                  to="/home" 
                  className={({ isActive }) => 
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      Home
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink 
                  to="/products" 
                  className={({ isActive }) => 
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      Shop
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink 
                  to="/training" 
                  className={({ isActive }) => 
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      Training
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink 
                  to="/recipes" 
                  className={({ isActive }) => 
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      Recipes
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      About
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink 
                  to="/farmer-dashboard" 
                  className={({ isActive }) => 
                    `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      Dashboard
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            </div>

            {/* Right side icons with Enhanced Styling */}
            <div className="flex items-center">
              {/* Enhanced Search Bar - Desktop */}
              <div className="hidden md:block mr-6">
                <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-105' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className={`h-5 w-5 transition-colors duration-300 ${searchFocused ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`block w-64 pl-12 pr-4 py-3 border-2 rounded-full leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm shadow-md hover:shadow-lg ${
                      searchFocused ? 'border-green-400 shadow-lg shadow-green-100' : 'border-gray-200 hover:border-green-300'
                    }`}
                    placeholder="Search for organic produce..."
                    type="search"
                  />
                  {searchFocused && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                        <FiSearch className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Enhanced Icon Buttons */}
                <button className="group p-3 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-50/80 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition-all duration-300 transform hover:scale-110 relative overflow-hidden">
                  <FiHeart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
                </button>
                
                <button
                  onClick={() => Navigate('/cart')}
                  className="group p-2 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-50/80 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                >
                  <FiShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="absolute -top-0 -right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                    3
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
                </button>
                
                <button className="group p-3 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-50/80 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition-all duration-300 transform hover:scale-110 relative overflow-hidden">
                  <FiUser className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
                </button>
              </div>

              {/* Enhanced Mobile menu button */}
              <div className="md:hidden ml-4">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="group inline-flex items-center justify-center p-3 rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50/80 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                >
                  <div className="relative">
                    {isMobileMenuOpen ? (
                      <FiX className="block h-6 w-6 transition-transform duration-300 transform rotate-180" />
                    ) : (
                      <FiMenu className="block h-6 w-6 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile menu with slide animation */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-2 bg-gradient-to-br from-white/95 to-green-50/90 backdrop-blur-md shadow-xl border-t border-green-100">
            {/* Enhanced Search Bar - Mobile */}
            <div className="px-2 py-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-green-500" />
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-full leading-5 bg-white/90 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm shadow-md transition-all duration-300"
                  placeholder="Search for organic produce..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Enhanced Mobile Navigation Links */}
            <NavLink 
              to="/home" 
              className={({ isActive }) => 
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-200' 
                    : 'text-gray-700 hover:bg-green-100/80 hover:text-green-700 hover:shadow-md'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <span>🏠</span>
                <span className="ml-3">Home</span>
              </div>
            </NavLink>
            
            <NavLink 
              to="/products" 
              className={({ isActive }) => 
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-200' 
                    : 'text-gray-700 hover:bg-green-100/80 hover:text-green-700 hover:shadow-md'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <span>🛍️</span>
                <span className="ml-3">Shop</span>
              </div>
            </NavLink>
            
            <NavLink 
              to="/training" 
              className={({ isActive }) => 
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-200' 
                    : 'text-gray-700 hover:bg-green-100/80 hover:text-green-700 hover:shadow-md'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <span>📚</span>
                <span className="ml-3">Training</span>
              </div>
            </NavLink>
            
            <NavLink 
              to="/recipes" 
              className={({ isActive }) => 
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-200' 
                    : 'text-gray-700 hover:bg-green-100/80 hover:text-green-700 hover:shadow-md'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <span>👩‍🍳</span>
                <span className="ml-3">Recipes</span>
              </div>
            </NavLink>
            
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-200' 
                    : 'text-gray-700 hover:bg-green-100/80 hover:text-green-700 hover:shadow-md'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <span>ℹ️</span>
                <span className="ml-3">About</span>
              </div>
            </NavLink>
            
            {/* Enhanced Mobile Action Buttons */}
            <div className="border-t border-green-200 pt-4 mt-4">
              <div className="flex items-center justify-around px-4 space-x-2">
                <button className="group flex flex-col items-center justify-center p-3 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-100/80 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 transform hover:scale-110 min-w-0 flex-1">
                  <FiUser className="h-6 w-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-xs font-medium">Account</span>
                </button>
                
                <button className="group flex flex-col items-center justify-center p-3 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-100/80 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 transform hover:scale-110 min-w-0 flex-1">
                  <FiHeart className="h-6 w-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-xs font-medium">Wishlist</span>
                </button>
                
                <button 
                  onClick={() => Navigate('/cart')}
                  className="group flex flex-col items-center justify-center p-3 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-100/80 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 transform hover:scale-110 relative min-w-0 flex-1"
                >
                  <div className="relative">
                    <FiShoppingCart className="h-6 w-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      3
                    </span>
                  </div>
                  <span className="text-xs font-medium">Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;