import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Video, FileText, Award, ChevronDown, Play, Users, TrendingUp } from 'lucide-react';

const TrainingQuickAccess = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const trainingCategories = [
    {
      icon: Video,
      title: "Video Tutorials",
      link: "/training?type=Video",
      count: "50+",
      color: "text-blue-600"
    },
    {
      icon: FileText,
      title: "Guides & Articles",
      link: "/training?type=Guide",
      count: "100+", 
      color: "text-green-600"
    },
    {
      icon: Award,
      title: "Certification Programs",
      link: "/training?category=Certification",
      count: "5+",
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Browse All Training",
      link: "/training",
      icon: BookOpen,
      description: "Explore our complete library"
    },
    {
      title: "Add New Training",
      link: "/add",
      icon: Play,
      description: "Contribute to the community"
    }
  ];

  return (
    <div className="relative">
    
      <div 
        className="relative"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <NavLink 
          to="/training" 
          className={({ isActive }) => 
            `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center ${
              isActive 
                ? 'text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-200' 
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:shadow-md'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <BookOpen className="mr-1 h-4 w-4" />
              Training
              <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>

       
        <div className={`absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform origin-top ${
          isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}>
          
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
            <h3 className="font-semibold text-lg">Training Categories</h3>
            <p className="text-green-100 text-sm">Choose your learning path</p>
          </div>
          
          <div className="p-2">
            {trainingCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <NavLink
                  key={index}
                  to={category.link}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                    <IconComponent className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {category.title}
                    </div>
                    <div className="text-sm text-gray-500">{category.count} available</div>
                  </div>
                </NavLink>
              );
            })}
          </div>
          
          <div className="border-t border-gray-100"></div>
          
          <div className="p-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <NavLink
                  key={index}
                  to={action.link}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <IconComponent className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {action.title}
                    </div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>2,500+ learners</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>94% success rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingQuickAccess;
