import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBook } from 'react-icons/fa';
import BackButton from './common/BackButton';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-farmer-green-500 rounded-lg flex items-center justify-center">
                <FaBook className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">FarmNex Training</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <BackButton fallback="/" className="text-sm" />
            
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-farmer-green-600 transition-colors"
            >
              <FaHome className="text-sm" />
              <span className="font-medium">Home</span>
            </Link>
            
            <Link
              to="/add"
              className="btn-primary text-sm py-2 px-4"
            >
              Add Training
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
