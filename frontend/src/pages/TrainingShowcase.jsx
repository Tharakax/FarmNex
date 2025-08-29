import React from 'react';
import { NavLink } from 'react-router-dom';
import Navigation from '../components/navigation';
import { 
  BookOpen, Video, FileText, Award, ArrowRight, Users, TrendingUp, Clock, 
  Play, Download, Star, CheckCircle, Target, Lightbulb 
} from 'lucide-react';

const TrainingShowcase = () => {
  const trainingCategories = [
    {
      id: 1,
      icon: Video,
      title: "Video Learning",
      description: "Interactive video tutorials with expert demonstrations",
      count: "50+ Videos",
      features: ["HD Quality", "Subtitles", "Mobile Friendly"],
      color: "bg-blue-500",
      bgGradient: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      icon: FileText,
      title: "Written Guides",
      description: "Comprehensive step-by-step farming guides and articles",
      count: "100+ Guides", 
      features: ["Downloadable", "Printable", "Illustrated"],
      color: "bg-green-500",
      bgGradient: "from-green-500 to-green-600"
    },
    {
      id: 3,
      icon: Award,
      title: "Certification",
      description: "Earn certificates in sustainable farming practices",
      count: "5+ Programs",
      features: ["Verified", "Industry Recognized", "Progress Tracking"],
      color: "bg-purple-500",
      bgGradient: "from-purple-500 to-purple-600"
    }
  ];

  const learningPaths = [
    {
      title: "Beginner Farmer",
      description: "Start your farming journey with basic techniques",
      duration: "4 weeks",
      modules: 12,
      level: "Beginner",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Sustainable Agriculture",
      description: "Learn eco-friendly and sustainable farming methods",
      duration: "6 weeks", 
      modules: 18,
      level: "Intermediate",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Advanced Crop Management",
      description: "Master advanced techniques for maximum yield",
      duration: "8 weeks",
      modules: 24,
      level: "Advanced", 
      color: "bg-purple-100 text-purple-800"
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Practical Skills",
      description: "Learn hands-on farming techniques you can apply immediately"
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from certified agricultural professionals with years of experience"
    },
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "94% of our learners report improved farming productivity"
    },
    {
      icon: Lightbulb,
      title: "Latest Techniques",
      description: "Stay updated with modern farming innovations and best practices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      
      <div className="pt-24">
        {/* Hero Section */}
        <section 
          className="relative py-20 px-4 sm:px-6 lg:px-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              Master <span className="text-green-400">Modern</span> Agriculture
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto drop-shadow-md">
              Unlock your farming potential with our comprehensive training platform. 
              From beginner basics to advanced techniques, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/training">
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Now
                </button>
              </NavLink>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors backdrop-blur-sm">
                View Learning Paths
              </button>
            </div>
          </div>
        </section>

        {/* Training Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Style</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We offer multiple formats to match your preferred learning style and schedule
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trainingCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                    <div className={`bg-gradient-to-r ${category.bgGradient} p-6 text-white`}>
                      <IconComponent className="h-12 w-12 mb-4" />
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="opacity-90">{category.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="text-2xl font-bold text-gray-900 mb-4">{category.count}</div>
                      <div className="space-y-2 mb-6">
                        {category.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <NavLink to="/training" className="w-full">
                        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          Explore {category.title}
                        </button>
                      </NavLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Learning Paths */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Structured Learning Paths</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow our curated learning paths designed by agricultural experts
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {learningPaths.map((path, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${path.color}`}>
                      {path.level}
                    </span>
                    <span className="text-gray-500 text-sm">{path.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                  <p className="text-gray-600 mb-4">{path.description}</p>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-500">{path.modules} modules</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <NavLink to="/training" className="w-full">
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Start Learning
                    </button>
                  </NavLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Training?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our training platform is designed by farmers, for farmers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-all">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Ready to Transform Your Farming?</h2>
            <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Join thousands of farmers who have improved their yields and practices through our training program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/training">
                <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse All Training
                </button>
              </NavLink>
              <NavLink to="/add">
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105 backdrop-blur-sm inline-flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Add Training Content
                </button>
              </NavLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TrainingShowcase;
