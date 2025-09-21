import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Video, FileText, Award, ArrowRight, Users, TrendingUp, Clock } from 'lucide-react';

const TrainingNavSection = () => {
  const trainingHighlights = [
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step farming techniques from expert agriculturists",
      count: "50+ Videos",
      color: "bg-blue-100 text-blue-600",
      hoverColor: "hover:bg-blue-200"
    },
    {
      icon: FileText,
      title: "Comprehensive Guides", 
      description: "Detailed farming guides and best practices documentation",
      count: "100+ Guides",
      color: "bg-green-100 text-green-600",
      hoverColor: "hover:bg-green-200"
    },
    {
      icon: Award,
      title: "Expert Knowledge",
      description: "Learn from certified agricultural experts and experienced farmers",
      count: "Expert Led",
      color: "bg-purple-100 text-purple-600",
      hoverColor: "hover:bg-purple-200"
    }
  ];

  const quickStats = [
    {
      icon: Users,
      label: "Active Learners",
      value: "2,500+",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: "94%",
      color: "text-green-600"
    },
    {
      icon: Clock,
      label: "Hours of Content",
      value: "150+",
      color: "text-purple-600"
    }
  ];

  return (
    <section 
      id="training-nav-section" 
      className="py-16 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=800&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Agricultural Training & Education
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Enhance your farming knowledge with our comprehensive training materials. 
            Learn modern techniques, sustainable practices, and boost your productivity.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/20 transition-all">
                <IconComponent className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
        
        {/* Training Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {trainingHighlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <div key={index} className="bg-white/95 backdrop-blur-sm p-6 rounded-lg hover:shadow-xl transition-all transform hover:scale-105">
                <div className={`w-16 h-16 ${highlight.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${highlight.hoverColor} transition-colors`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{highlight.title}</h3>
                <p className="text-gray-600 text-center mb-3">{highlight.description}</p>
                <div className="text-center">
                  <span className="inline-block bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {highlight.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <NavLink to="/training">
            <button className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore All Training Materials
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </NavLink>
        </div>
      </div>
    </section>
  );
};

export default TrainingNavSection;
